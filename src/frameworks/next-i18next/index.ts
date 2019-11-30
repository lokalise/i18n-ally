import { TextDocument } from 'vscode'
import { Framework } from '../base'
import { LanguageId } from '../../utils'

class NextI18nFramework extends Framework {
  id = 'next-i18next'
  display = 'Next i18next'

  detection = {
    packageJSON: [
      'next-i18next',
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
    /[^\w\d](?:Trans[ (]i18nKey=|FormattedMessage[ (]id=|(?:t)\()['"`]([[\w\d\. :\-\[\]]*?)['"`]/g,
  ]

  refactorTemplates (keypath: string) {
    return [
      `{t('${keypath}')}`,
      `t('${keypath}')`,
      keypath,
    ]
  }

  getDefaultNamespaces = (document: TextDocument) => {
    // default namespace in i18next will be like this:
    /*
      Homepage.getInitialProps = async () => ({
        namespacesRequired: ['common', 'footer'],
      })
    */

    const text = document.getText()
    const regex = /namespacesRequired:\s?\[?((?:['"`][\w\d\-]+['"`],?\s?)*)\]?/g
    const match = regex.exec(text)
    if (!match)
      return

    const value = match[1]
    const result = []

    const namespaceRegex = /['"`]([\w\d\-]+)['"`]/g
    let m: RegExpExecArray | null

    // eslint-disable-next-line no-cond-assign
    while (m = namespaceRegex.exec(value)) {
      if (m[1] != null)
        result.push(m[1])
    }

    return result
  }

  enableFeatures = {
    namespace: true,
  }
}

export default NextI18nFramework
