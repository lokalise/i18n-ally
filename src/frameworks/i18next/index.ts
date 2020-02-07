import { LanguageId } from '../../utils'
import { Framework } from '../base'

class I18nextFramework extends Framework {
  id ='i18next'
  display = 'i18next'

  detection = {
    packageJSON: {
      any: [
        'i18next',
      ],
      none: [
        'react-i18next',
        'next-i18next',
      ],
    },
  }

  languageIds: LanguageId[] = [
    'javascript',
    'typescript',
    'tyspescriptreact',
    'typescriptreact',
    'ejs',
  ]

  // for visualize the regex, you can use https://regexper.com/
  keyMatchReg = [
    /(?:i18next|i18n)\.t\(\s*['"`]([\w\d\. \-\[\]]*?)['"`]/gm,
  ]

  refactorTemplates(keypath: string) {
    return [
      keypath,
    ]
  }
}

export default I18nextFramework
