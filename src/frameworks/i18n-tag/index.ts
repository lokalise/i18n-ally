import { Framework } from '../base'

class I18nTagFramework extends Framework {
  id ='i18n-tag'
  display = 'i18n Tag'

  detection = {
    packageJSON: [
      'es2015-i18n-tag',
    ],
  }

  languageIds = [
    'javascript',
    'typescript',
    'tyspescriptreact',
    'typescriptreact',
    'vue',
  ]

  keyMatchReg = [
    /i18n`[\w\d\. -\[\]]+?`/g,
  ]

  refactorTemplates (keypath: string) {
    return [
      `i18n\`${keypath}\``,
      keypath,
    ]
  }
}

export default I18nTagFramework
