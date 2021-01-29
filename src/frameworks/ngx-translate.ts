import { Framework } from './base'
import { LanguageId } from '~/utils'

class NgxTranslateFramework extends Framework {
  id = 'ngx-translate'
  display = 'Angular ngx-translate'

  detection = {
    packageJSON: [
      '@ngx-translate/core',
    ],
  }

  languageIds: LanguageId[] = [
    'javascript',
    'typescript',
    'html',
  ]

  // for visualize the regex, you can use https://regexper.com/
  usageMatchRegex= [
    '[`\'"]({key})[`\'"][\\s\\n]*\\|[\\s\\n]*translate',
    '(?:translate|translateService)\\.(?:get|instant)\\([\\s\\n]*[\'"`]({key})[\'"`]',
    '[\\s\\n]translate>[\\s\\n]*({key})[\\s\\n]*</',
  ]

  refactorTemplates(keypath: string, languageId: string) {
    return [
      `{{ '${keypath}' | translate }}`,
      keypath,
    ]
  }
}

export default NgxTranslateFramework
