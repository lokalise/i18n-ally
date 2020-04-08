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
      return '"%({key})%"'
    // for visualize the regex, you can use https://regexper.com/
    return '(?:i18n[ (]path=|v-t=[\'"`{]|(?:this\\.|\\$|i18n\\.)(?:(?:d|n)\\(.*?,|(?:t|tc|te)\\()\\s*)[\'"`]({key})[\'"`]'
  }

  refactorTemplates(keypath: string, languageId: string) {
    return [
      `i18n.t('${keypath}')`,
      keypath,
    ]
  }

  pathMatcher() {
    return 'package.nls.?{locale?}.json'
  }
}

export default VSCodeFramework
