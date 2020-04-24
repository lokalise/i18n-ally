import { basename } from 'path'
import { LanguageId } from '../utils'
import { Framework } from './base'

class VSCodeFramework extends Framework {
  id = 'vscode'
  display = 'VS Code'

  detection = {
    packageJSON: [
      'vscode',
      '@types/vscode',
    ],
  }

  enabledParsers = ['json']

  languageIds: LanguageId[] = [
    'json',
    'javascript',
    'typescript',
  ]

  pathMatcher = () => 'package.nls.?{locale?}.json'

  usageMatchRegex = (languageIds?: string, filename?: string) => {
    if (filename && basename(filename) === 'package.json')
      return '"%({key})%"'
    // for visualize the regex, you can use https://regexper.com/
    return '(?:i18n[ (]path=|v-t=[\'"`{]|(?:this\\.|\\$|i18n\\.)(?:(?:d|n)\\(.*?,|(?:t|tc|te)\\()\\s*)[\'"`]({key})[\'"`]'
  }

  refactorTemplates(keypath: string, languageId: string) {
    if (languageId === 'json') {
      return [
        `%${keypath}%`,
        keypath,
      ]
    }

    return [
      `i18n.t('${keypath}')`,
      keypath,
    ]
  }
}

export default VSCodeFramework
