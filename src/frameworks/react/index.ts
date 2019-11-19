import { Framework } from '../base'

class ReactFramework extends Framework {
  id= 'react'
  display= 'React'

  detection= {
    packageJSON: [
      'react-i18next',
      'react-intl',
      'next-i18next',
    ],
  }

  languageIds= [
    'javascript',
    'typescript',
    'tyspescriptreact',
    'typescriptreact',
  ]

  // for visualize the regex, you can use https://regexper.com/
  keyMatchReg= {
    '*': [
      // eslint-disable-next-line no-useless-escape
      /(?:Trans[ (]i18nKey=|FormattedMessage[ (]id=|(?:t)\()['"`]([\w\d\. -\[\]]+?)['"`]/g,
    ],
  }

  refactorTemplates (keypath: string) {
    return [
      `{t('${keypath}')}`,
      `t('${keypath}')`,
      keypath,
    ]
  }
}

export default ReactFramework
