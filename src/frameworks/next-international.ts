/* eslint-disable no-console */
import { TextDocument } from 'vscode'
import { Framework, ScopeRange } from './base'
import { LanguageId } from '~/utils'
import { RewriteKeySource, RewriteKeyContext, KeyStyle } from '~/core'

class NextInternationalFramework extends Framework {
  id = 'next-international'
  display = 'next-international'
  namespaceDelimiter = '.'
  perferredKeystyle?: KeyStyle = 'flat'

  namespaceDelimiters = ['.']
  namespaceDelimitersRegex = /[\.]/g

  detection = {
    packageJSON: [
      'next-international',
    ],
  }

  languageIds: LanguageId[] = [
    'javascript',
    'typescript',
    'javascriptreact',
    'typescriptreact',
  ]

  usageMatchRegex = [
    // Basic usage
    '[^\\w\\d]t\\([\'"`]({key})[\'"`]',
    // Scoped usage
    '[^\\w\\d]scopedT\\([\'"`]({key})[\'"`]',
  ]

  refactorTemplates(keypath: string) {
    const keypaths = keypath.split('.').map((_, index, parts) => {
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

  getScopeRange(document: TextDocument): ScopeRange[] | undefined {
    if (!this.languageIds.includes(document.languageId as any))
      return

    const ranges: ScopeRange[] = []
    const text = document.getText()

    const useScopedTRegex = /const scopedT = useScopedI18n\(\s*(['"`](.*?)['"`])?/g
    const namespaceMatchArray = [...text.matchAll(useScopedTRegex)]
    for (let i = 0; i < namespaceMatchArray.length; i++) {
      const currentNamespaceMatch = namespaceMatchArray[i]
      if (typeof currentNamespaceMatch.index !== 'number')
        continue

      const nextNamespaceMatch = namespaceMatchArray[i + 1]

      const scopedText = text.slice(currentNamespaceMatch.index, nextNamespaceMatch?.index)

      const namespace = currentNamespaceMatch[2]
      const scopedTRegex = /scopedT\(['"`](.*?)['"`]\)/g
      for (const match of scopedText.matchAll(scopedTRegex)) {
        if (typeof match.index !== 'number')
          continue
        ranges.push({
          start: currentNamespaceMatch.index + match.index,
          end: currentNamespaceMatch.index + match.index + match[0].length,
          namespace,
        })
      }
    }

    return ranges
  }
}

export default NextInternationalFramework
