import { Framework } from './base'
import { LanguageId } from '~/utils'

class ReactFramework extends Framework {
  id= 'react'
  display= 'React'

  detection= {
    packageJSON: [
      'react-intl',
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
    // Support for i18nKey= and t( calls, key supports single, double, and back quotes
    '[^\\w\\d](?:i18nKey=|t\\(\\s*)[\'"`]({key})[\'"`]',
    // Since <FormattedMessage ... id=... /> may have multiple attributes and line breaks, handle it separately
    // Allow attribute line breaks and whitespace, support id="xxx.xxx", id={'xxx.xxx'}, etc.
    '<FormattedMessage[\\s\\S]*?id=\\s*\\{?\\s*[\'"`]([a-zA-Z0-9_.\\-]+)[\'"`]\\s*\\}?',
    // useIntl() hooks, https://github.com/formatjs/react-intl/blob/master/docs/API.md#useintl-hook
    '[^\\w\\d](?:formatPlural|formatNumber|formatDate|formatTime|formatHTMLMessage|formatMessage|formatRelativeTime)\\(.*?[\'"`]?id[\'"`]?:\\s*[\'"`]({key})[\'"`]',
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

export default ReactFramework
