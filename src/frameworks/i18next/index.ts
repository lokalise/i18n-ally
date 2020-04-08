import { RewriteKeySource, RewriteKeyContext } from '../../core'
import { LanguageId } from '../../utils'
import { Framework } from '../base'

class I18nextFramework extends Framework {
  id ='i18next'
  display = 'i18next'

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
  keyMatchReg = [
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
    return key.replace(/:/g, '.')
  }
}

export default I18nextFramework
