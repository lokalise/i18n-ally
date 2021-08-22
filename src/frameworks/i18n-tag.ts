import { Framework } from './base'
import { LanguageId } from '~/utils'

class I18nTagFramework extends Framework {
  id ='i18n-tag'
  display = 'i18n Tag'

  detection = {
    packageJSON: [
      'es2015-i18n-tag',
    ],
  }

  languageIds: LanguageId[] = [
    'javascript',
    'typescript',
    'javascriptreact',
    'typescriptreact',
    'vue',
    'ejs',
  ]

  usageMatchRegex = [
    'i18n`({key})`',
  ]

  refactorTemplates(keypath: string) {
    return [
      `i18n\`${keypath}\``,
      keypath,
    ]
  }
}

export default I18nTagFramework
