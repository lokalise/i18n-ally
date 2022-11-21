import { Framework } from './base'
import { LanguageId } from '~/utils'

class ReactI18nextFramework extends Framework {
  id= 'react-i18next'
  display= 'React'

  detection= {
    packageJSON: [
      'react-i18next',
      'next-i18next',
    ],
  }

  languageIds: LanguageId[] = [
    'javascript',
    'typescript',
    'javascriptreact',
    'typescriptreact',
    'ejs',
  ]

  // for visualize the regex, you can use https://regexper.com/
  usageMatchRegex = [
    // general jsx attrs
    '[^\\w\\d](?:i18nKey=|FormattedMessage[ (]\\s*id=|t\\(\\s*)[\'"`]({key})[\'"`]',
    '<Trans>({key})<\\/Trans>',
  ]

  refactorTemplates(keypath: string) {
    return [
      `{t('${keypath}')}`,
      `t('${keypath}')`,
      keypath,
    ]
  }
}

export default ReactI18nextFramework
