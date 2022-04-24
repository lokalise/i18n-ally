import { Framework } from './base'
import { RewriteKeySource, RewriteKeyContext } from '~/core'
import { LanguageId } from '~/utils'

class SapphireI18nextFramework extends Framework {
  id = 'sapphire-i18next'
  display = 'sapphire-i18next'
  namespaceDelimiter = ':'

  namespaceDelimiters = [':', '/']
  namespaceDelimitersRegex = /[:/]/g

  detection = {
    packageJSON: [
      '@sapphire/plugin-i18next',
    ],
  }

  languageIds: LanguageId[] = [
    'javascript',
    'typescript',
  ]

  // for visualize the regex, you can use https://regexper.com/
  usageMatchRegex = [
    '\\b(?:(?:resolveKey)|(?:(?:send)|(?:reply)|(?:edit))Localized)\\(\\s*?[\\s\\S]*?\\s*?,?\\s*?(?:{?\\s*?(?:[\\s\\S]*?,?)?\\s*?(?:keys:)?\\s*?\\[?[\'"`]({key})[\'"`]\\]?\\s*?(?:,[\\s\\S]*?)?}?)\\)',
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
}

export default SapphireI18nextFramework
