import { basename } from 'path'
import { Framework } from '../base'
import { LanguageId } from '../../utils'

class VSCodeFramework extends Framework {
  id = 'vscode'
  display = 'VSCode'

  detection = {
    packageJSON: [
      'vscode',
      '@types/vscode',
    ],
  }

  languageIds: LanguageId[] = [
    'json',
    'javascript',
    'typescript',
  ]

  keyMatchReg = (languageIds?: string, filename?: string) => {
    if (filename && basename(filename) === 'package.json')
      return /"%([\w\d\. \-\[\]]*?)%"/g
    // for visualize the regex, you can use https://regexper.com/
    return /(?:i18n[ (]path=|v-t=['"`{]|(?:this\.|\$|i18n\.)(?:(?:d|n)\(.*?, ?|(?:t|tc|te)\())['"`]([\w\d\. \-\[\]]*?)['"`]/g
  }

  refactorTemplates(keypath: string, languageId: string) {
    return [
      `i18n.t('${keypath}')`,
      keypath,
    ]
  }

  filenameMatchReg() {
    return '^package.nls.?([\\w-]*)\\.json'
  }
}

export default VSCodeFramework
