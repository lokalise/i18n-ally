import { Framework } from './base'
import { LanguageId } from '~/utils'

class PolyglotFramework extends Framework {
  id = 'polyglot'
  display= 'Polyglot'

  detection= {
    packageJSON: [
      'node-polyglot',
    ],
  }

  languageIds: LanguageId[] = [
    'javascript',
    'typescript',
    'javascriptreact',
    'typescriptreact',
    'ruby',
  ]

  // for visualize the regex, you can use https://regexper.com/
  usageMatchRegex = [
    '(?:polyglot|I18n)\\.t\\(\\s*[\'"`]({key})[\'"`]',
  ]

  refactorTemplates(keypath: string) {
    return [
      `polyglot.t('${keypath}')`,
      `I18N.t('${keypath}')`,
      keypath,
    ]
  }
}

export default PolyglotFramework
