import { Framework } from '../base'
import { LanguageId } from '../../utils'

class ReactFramework extends Framework {
  id= 'react'
  display= 'React'

  detection= {
    packageJSON: [
      'react-i18next',
      'react-intl',
    ],
  }

  languageIds: LanguageId[] = [
    'javascript',
    'typescript',
    'tyspescriptreact',
    'typescriptreact',
  ]

  // for visualize the regex, you can use https://regexper.com/
  keyMatchReg = [
    /[^\w\d](?:Trans[ (]i18nKey=|FormattedMessage[ (]id=|(?:t)\()['"`]([[\w\d\. \-\[\]]*?)['"`]/g,
  ]

  refactorTemplates (keypath: string) {
    return [
      `{t('${keypath}')}`,
      `t('${keypath}')`,
      keypath,
    ]
  }
}

export default ReactFramework
