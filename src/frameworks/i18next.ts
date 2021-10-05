import { TextDocument } from 'vscode'
import { Framework, ScopeRange } from './base'
import { RewriteKeySource, RewriteKeyContext } from '~/core'
import { LanguageId } from '~/utils'

class I18nextFramework extends Framework {
  id ='i18next'
  display = 'i18next'
  namespaceDelimiter = ':'

  // both `/` and `:` should work as delimiter, #425
  namespaceDelimiters = [':', '/']
  namespaceDelimitersRegex = /[:/]/g

  detection = {
    packageJSON: {
      any: [
        'i18next',
      ],
      none: [
        'react-i18next',
        'next-i18next',
      ],
    },
  }

  languageIds: LanguageId[] = [
    'javascript',
    'typescript',
    'javascriptreact',
    'typescriptreact',
    'ejs',
  ]

  // for visualize the regex, you can use https://regexper.com/
  usageMatchRegex = [
    '(?:i18next|i18n|req)\\.t\\(\\s*[\'"`]({key})[\'"`]',
  ]

  derivedKeyRules = [
    '{key}_plural',
    '{key}_0',
    '{key}_1',
    '{key}_2',
    '{key}_3',
    '{key}_4',
    '{key}_5',
    '{key}_6',
    '{key}_7',
    '{key}_8',
    '{key}_9',
  ]

  refactorTemplates(keypath: string) {
    return [
      keypath,
    ]
  }

  rewriteKeys(key: string, source: RewriteKeySource, context: RewriteKeyContext = {}) {
    const dotedKey = key.split(this.namespaceDelimitersRegex).join('.')

    // when explicitly set the namespace, ignore current namespace scope
    if (
      this.namespaceDelimiters.some(d => key.includes(d))
      && context.namespace
      && dotedKey.startsWith(context.namespace.split(this.namespaceDelimitersRegex).join('.'))
    )
      // +1 for the an extra `.`
      key = key.slice(context.namespace.length + 1)

    // replace colons
    return dotedKey
  }

  // useTranslation
  // https://react.i18next.com/latest/usetranslation-hook#loading-namespaces
  getScopeRange(document: TextDocument): ScopeRange[] | undefined {
    if (!this.languageIds.includes(document.languageId as any))
      return

    const ranges: ScopeRange[] = []
    const text = document.getText()
    const reg = /useTranslation\(\s*\[?\s*['"`](.*?)['"`]/g

    for (const match of text.matchAll(reg)) {
      if (match?.index == null)
        continue

      // end previous scope
      if (ranges.length)
        ranges[ranges.length - 1].end = match.index

      // start new scope if namespace provides
      if (match[1]) {
        ranges.push({
          start: match.index,
          end: text.length,
          namespace: match[1] as string,
        })
      }
    }

    return ranges
  }
}

export default I18nextFramework
