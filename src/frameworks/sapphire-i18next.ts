import { Framework } from './base'
import { RewriteKeyContext, RewriteKeySource } from '~/core'
import { LanguageId } from '~/utils'

class SapphireI18nextFramework extends Framework {
  id = 'sapphire-i18next'
  display = 'sapphire-i18next'
  namespaceDelimiter = ':'

  namespaceDelimiters = [':', '/']
  namespaceDelimitersRegex = /[:/]/g

  perferredLocalePaths = [
    'src/languages',
  ]

  enableFeatures = {
    namespace: true,
  }

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
    '\\b(?:(?:resolveKey)|(?:(?:send)|(?:reply)|(?:edit))Localized)\\(\\s*?[\\s\\S]*?\\s*?,\\s*?{?\\s*?(?:[\\s\\S]*?,?)?\\s*?keys:\\s*?\\[?[\'"`](.*?)[\'"`]\\]?',
    '\\b(?:(?:resolveKey)|(?:(?:send)|(?:reply)|(?:edit))Localized)\\(\\s*?[\\s\\S]*?\\s*?,\\s*?\\[?[\'"`](.*?)[\'"`]\\]?',
    '(?:i18n\\s*?\\.)?(?:(?:getT)|(?:format))\\([\\s\\S]*?(?:(?:\\)\\s*?\\()|(?:,))\\s*?[\'"`](.*?)[\'"`]',
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

  pathMatcher(): string {
    return '{locale}/{namespaces}.{ext}'
  }

  refactorTemplates(keypath: string) {
    return [
      `resolveKey(target, '${keypath}')`,
      `replyLocalized(target, '${keypath}')`,
      `editLocalized(target, '${keypath}')`,
      `sendLocalized(target, '${keypath}')`,
      `container.i18n.getT(locale)('${keypath}')`,
      `container.i18n.format(locale, '${keypath}')`,
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
