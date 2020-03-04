import { Framework } from '../base'
import { LanguageId } from '../../utils'

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
  keyMatchReg= [
    '{{\\s?[`\'"]({key})[`\'"]\\s*\\|\\s*translate',
    'translate\\.get\\(\\s*[\'"`]({key})[\'"`]',
  ]

  refactorTemplates(keypath: string, languageId: string) {
    return [
      `{{ '${keypath}' | translate }}`,
      keypath,
    ]
  }
}

export default NgxTranslateFramework
