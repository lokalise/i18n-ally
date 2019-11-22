import { Framework } from '../base'

class NgxTranslateFramework extends Framework {
  id = 'ngx-translate'
  display = 'Angular ngx-translate'

  detection = {
    packageJSON: [
      '@ngx-translate/core',
    ],
  }

  languageIds = [
    'javascript',
    'typescript',
  ]

  // for visualize the regex, you can use https://regexper.com/
  keyMatchReg= [
    /{{\s?[`'"]([\w\d\. -\[\]]+?)[`'"]\s?\|\s?translate/g,
    /translate\.get\(['"`]([\w\d\. -\[\]]+?)['"`]/g,
  ]

  refactorTemplates (keypath: string, languageId: string) {
    return [
      `{{ '${keypath}' | translate }}`,
      keypath,
    ]
  }
}

export default NgxTranslateFramework
