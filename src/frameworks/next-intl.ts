import { TextDocument } from 'vscode'
import { Framework, ScopeRange } from './base'
import { KeyStyle, RewriteKeyContext, RewriteKeySource } from '~/core'
import { LanguageId } from '~/utils'

export interface NextIntlScopeRange extends ScopeRange {
  functionName?: string
}

export const isNextIntlScopeRange = (scope: ScopeRange): scope is NextIntlScopeRange => {
  return (scope as NextIntlScopeRange).functionName !== undefined
}

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
    // Match: t, tSpecific, tFoo (capture the full variable name to use in scope detection)
    // Basic usage
    '[^\\w\\d](t(?:[A-Z]\\w*)?)\\s*\\(\\s*[\'"`]({key})[\'"`]',

    // Rich text
    '[^\\w\\d](t(?:[A-Z]\\w*)?)\\s*\\.rich\\s*\\(\\s*[\'"`]({key})[\'"`]',

    // Markup text
    '[^\\w\\d](t(?:[A-Z]\\w*)?)\\s*\\.markup\\s*\\(\\s*[\'"`]({key})[\'"`]',

    // Raw text
    '[^\\w\\d](t(?:[A-Z]\\w*)?)\\s*\\.raw\\s*\\(\\s*[\'"`]({key})[\'"`]',
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
      key = key.slice(context.namespace.length + 1)
    }

    return dottedKey
  }

  getScopeRange(document: TextDocument): NextIntlScopeRange[] | undefined {
    if (!this.languageIds.includes(document.languageId as any))
      return

    const ranges: NextIntlScopeRange[] = []
    const text = document.getText()

    // Find matches of `useTranslations` and `getTranslations` and extracts the variable names.
    // If there are multiple occurrences in the same file, there will be multiple, overlapping scopes.
    // During resolution, the variable name will be used to determine which scope the key belongs to, allowing multiple namespaces in the same file.
    const regex = /(?:const|let|var)\s+(t(?:[A-Z]\w*)?)\s*=\s*(?:await\s+)?(useTranslations|getTranslations)\s*\(\s*['"`](.*?)['"`]\)/g

    for (const match of text.matchAll(regex)) {
      if (typeof match.index !== 'number')
        continue

      const variableName = match[1]
      const namespace = match[3]

      // Add a new scope if a namespace is provided
      if (namespace) {
        ranges.push({
          start: match.index,
          end: text.length,
          namespace,
          functionName: variableName,
        })
      }
    }

    return ranges
  }
}

export default NextIntlFramework
