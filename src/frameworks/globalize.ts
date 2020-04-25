import { LanguageId } from '../utils'
import { Framework } from './base'

class GlobalizeFramework extends Framework {
  id = 'globalize'
  display= 'Globalize'

  detection= {
    packageJSON: [
      'globalize',
    ],
  }

  languageIds: LanguageId[] = [
    'javascript',
    'typescript',
    'javascriptreact',
    'typescriptreact',
  ]

  // for visualize the regex, you can use https://regexper.com/
  usageMatchRegex = [
    '\.(?:messageFormatter|formatMessage)\\(\\s*[\'"`]({key})[\'"`]',
  ]

  refactorTemplates(keypath: string) {
    return [
      `Globalize.messageFormatter('${keypath}')`,
      `Globalize.formatMessage('${keypath}')`,
      keypath,
    ]
  }

  rewriteKeys(keypath: string) {
    return keypath.replace(/\//g, '.')
  }
}

export default GlobalizeFramework
