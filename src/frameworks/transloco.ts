import { LanguageId } from '../utils'
import { Framework } from './base'

export default class TranslocoFramework extends Framework {
  id = 'transloco'
  display = 'Angular Transloco'

  detection = {
    packageJSON: [
      '@ngneat/transloco',
    ],
  }

  languageIds: LanguageId[] = [
    'javascript',
    'typescript',
    'html',
  ]

  keyMatchReg= [
    // https://netbasal.gitbook.io/transloco/translation-in-the-template/pipe
    '[`\'"]({key})[`\'"][\\s\\n]*\\|[\\s\\n]*transloco',
    // https://netbasal.gitbook.io/transloco/translation-in-the-template/structural-directive
    '[^\\w\\d](?:t|translate|selectTranslate|getTranslateObject|selectTranslateObject|getTranslation|setTranslationKey)\\([\\s\\n]*[\'"`]({key})[\'"`]',
    // https://netbasal.gitbook.io/transloco/translation-in-the-template/attribute-directive
    '[^*\\w\\d]transloco=[\'"`]({key})[\'"`]',
  ]

  refactorTemplates(keypath: string, languageId: string) {
    return [
      `{{ '${keypath}' | transloco }}`,
      `t('${keypath}')`,
      keypath,
    ]
  }
}
