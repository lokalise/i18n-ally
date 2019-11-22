import { Framework } from '../base'

class VSCodeFramework extends Framework {
  id = 'vscode'
  display = 'VSCode'

  detection = {
    packageJSON: [
      'vscode',
      '@types/vscode',
    ],
  }

  languageIds = [
    'javascript',
    'typescript',
  ]

  // for visualize the regex, you can use https://regexper.com/
  keyMatchReg = [
    // eslint-disable-next-line no-useless-escape
    /(?:i18n[ (]path=|v-t=['"`{]|(?:this\.|\$|i18n\.)(?:(?:d|n)\(.*?, ?|(?:t|tc|te)\())['"`]([\w\d\. -\[\]]+?)['"`]/g,
  ]

  refactorTemplates (keypath: string, languageId: string) {
    return [
      `i18n.t('${keypath}')`,
      keypath,
    ]
  }

  filenameMatchReg () {
    return '^package.nls.?([\\w-]*)\\.json'
  }
}

export default VSCodeFramework
