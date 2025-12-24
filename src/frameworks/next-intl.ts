import { TextDocument, workspace } from 'vscode'
import { Framework, ScopeRange } from './base'
import { LanguageId, File } from '~/utils'
import { RewriteKeySource, RewriteKeyContext, KeyStyle, KeyInDocument } from '~/core'
import { analyzeUseTranslations, analyzeTranslationUsages } from '~/analyzers/ast-analyzer'
import * as path from 'path'
import * as fs from 'fs'

class NextIntlFramework extends Framework {
  id = 'next-intl'
  display = 'next-intl'
  namespaceDelimiter = '.'
  perferredKeystyle?: KeyStyle = 'nested'

  namespaceDelimiters = ['.']
  namespaceDelimitersRegex = /[\.]/g

  detection = {
    packageJSON: [
      'next-intl',
    ],
  }

  languageIds: LanguageId[] = [
    'javascript',
    'typescript',
    'javascriptreact',
    'typescriptreact',
    'ejs',
  ]

  usageMatchRegex = [
    // Basic usage
    '[^\\w\\d]t\\s*\\(\\s*[\'"`]({key})[\'"`]',

    // Rich text
    '[^\\w\\d]t\\s*\\.rich\\s*\\(\\s*[\'"`]({key})[\'"`]',

    // Markup text
    '[^\\w\\d]t\\s*\\.markup\\s*\\(\\s*[\'"`]({key})[\'"`]',

    // Raw text
    '[^\\w\\d]t\\s*\\.raw\\s*\\(\\s*[\'"`]({key})[\'"`]',
  ]

  refactorTemplates(keypath: string) {
    // Ideally we'd automatically consider the namespace here. Since this
    // doesn't seem to be possible though, we'll generate all permutations for
    // the `keypath`. E.g. `one.two.three` will generate `three`, `two.three`,
    // `one.two.three`.

    const keypaths = keypath.split('.').map((cur, index, parts) => {
      return parts.slice(parts.length - index - 1).join('.')
    })
    return [
      ...keypaths.map(cur =>
        `{t('${cur}')}`,
      ),
      ...keypaths.map(cur =>
        `t('${cur}')`,
      ),
    ]
  }

  rewriteKeys(key: string, source: RewriteKeySource, context: RewriteKeyContext = {}) {
    const dottedKey = key.split(this.namespaceDelimitersRegex).join('.')

    // When the namespace is explicitly set, ignore the current namespace scope
    if (
      this.namespaceDelimiters.some(delimiter => key.includes(delimiter))
      && context.namespace
      && dottedKey.startsWith(context.namespace.split(this.namespaceDelimitersRegex).join('.'))
    ) {
      // +1 for the an extra `.`
      // Return the key with namespace prefix removed
      return dottedKey.slice(context.namespace.length + 1)
    }

    return dottedKey
  }

  createImporter(document: TextDocument) {
    return (importPath: string): string | undefined => {
      const filePath = document.uri.fsPath
      const dir = path.dirname(filePath)
      let resolvedPath = ''

      if (importPath.startsWith('.')) {
        resolvedPath = path.resolve(dir, importPath)
      }
      else if (importPath.startsWith('@/')) {
        const wsFolder = workspace.getWorkspaceFolder(document.uri)
        if (wsFolder) {
          // Try both root/@/... and root/src/@/...
          const possiblePaths = [
            path.join(wsFolder.uri.fsPath, importPath.slice(2)),
            path.join(wsFolder.uri.fsPath, 'src', importPath.slice(2)),
          ]

          for (const p of possiblePaths) {
             if (fs.existsSync(p) || fs.existsSync(p + '.ts') || fs.existsSync(p + '.tsx') || fs.existsSync(p + '/index.ts')) {
               resolvedPath = p
               break
             }
          }
           // Fallback to simple join if not found, to try extensions below
           if (!resolvedPath) resolvedPath = possiblePaths[0]
        }
      }
      else {
        // Absolute path or node_modules? We generally don't parse node_modules.
        return undefined
      }

      const extensions = ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.js']
      for (const ext of extensions) {
         if (fs.existsSync(resolvedPath + ext)) {
             try {
               return File.readSync(resolvedPath + ext)
             } catch (e) {
               return undefined
             }
         }
      }
      return undefined
    }
  }

  detectKeys(document: TextDocument): KeyInDocument[] | undefined {
    if (!this.languageIds.includes(document.languageId as any))
      return

    const text = document.getText()
    const filePath = document.uri.fsPath
    const importer = this.createImporter(document)

    // 1. Analyze useTranslations to find variable -> namespace mappings
    const translationsAnalysis = analyzeUseTranslations(text, filePath, importer)
    const varNamespaceMap = new Map<string, string>()

    for (const analysis of translationsAnalysis) {
      if (analysis.namespace) {
        varNamespaceMap.set(analysis.variableName, analysis.namespace)
      }
      // TODO: Handle dynamic namespaces via analysis.isDynamic/dynamicPlaceholder if needed
    }

    // 2. Analyze usages using the mappings to find keys (literals or variables)
    // analyzeTranslationUsages performs constant propagation for variable keys
    const analyzedKeys = analyzeTranslationUsages(text, varNamespaceMap, importer)

    return analyzedKeys.map(ak => ({
      key: ak.key,
      start: ak.start,
      end: ak.end,
      quoted: ak.quoted,
    }))
  }

  getScopeRange(document: TextDocument): ScopeRange[] | undefined {
    if (!this.languageIds.includes(document.languageId as any))
      return

    const ranges: ScopeRange[] = []
    const text = document.getText()
    const filePath = document.uri.fsPath
    const importer = this.createImporter(document)

    // Use AST-based analysis for accuracy
    const translationsAnalysis = analyzeUseTranslations(text, filePath, importer)

    // Build variable-to-namespace mapping
    const varNamespaceMap = new Map<string, string>()
    const dynamicVars = new Map<string, string>()

    for (const analysis of translationsAnalysis) {
      if (analysis.isDynamic) {
        if (analysis.dynamicPlaceholder)
          dynamicVars.set(analysis.variableName, analysis.dynamicPlaceholder)
      }
      else if (analysis.namespace) {
        varNamespaceMap.set(analysis.variableName, analysis.namespace)
      }
    }

    if (varNamespaceMap.size > 0 || dynamicVars.size > 0) {
      // Create a combined map for usage analysis
      const combinedMap = new Map<string, string>(varNamespaceMap)
      for (const [v, ns] of dynamicVars) {
        combinedMap.set(v, ns)
      }

      const usages = analyzeTranslationUsages(text, combinedMap, importer)

      for (const usage of usages) {
        // Use the namespace resolved by the analyzer (via scope or map)
        const namespace = usage.namespace

        if (namespace) {
          ranges.push({
            start: usage.start, // AnalyzedKey.start is the key position
            end: usage.end,
            namespace,
          })
        }
      }
    }

    // Fallback logic kept for legacy support (skipped here for brevity as generic Regex fallback should cover if AST fails completely, but keeping minimal fallback)
    if (ranges.length === 0) {
       // ... existing regex fallback logic can be preserved if needed, or rely on base class ...
       // For consistency with previous implementation, preserving regex logic here:
       const namespaceObjectRegex = /namespace:\s*['"`]([^'"`]+)['"`]/g
       let lastNamespaceMatch: RegExpMatchArray | null = null
       for (const match of text.matchAll(namespaceObjectRegex)) lastNamespaceMatch = match
       if (lastNamespaceMatch) {
         ranges.push({
           start: lastNamespaceMatch.index!,
           end: text.length,
           namespace: lastNamespaceMatch[1],
         })
       }
    }

    return ranges
  }
}

export default NextIntlFramework
