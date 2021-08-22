import { Framework } from './base'
import { LanguageId } from '~/utils'

class UI5Framework extends Framework {
  id = 'ui5'
  display = 'SAP UI5'

  detection = {
    packageJSON: [
      '@ui5/cli',
    ],
  }

  languageIds: LanguageId[] = [
    'json',
    'xml',
    'javascript',
    'typescript',
  ]

  // for visualize the regex, you can use https://regexper.com/
  usageMatchRegex = [
    '\\{(i18n>{key})\\}',
    'getResourceBundle\\(\\)\\.getText\\([\'"`]({key})[\'"`]',
    '\\{\\{({key})\\}\\}',
  ]

  refactorTemplates(keypath: string) {
    return [
      `{i18n>${keypath}}`,
      `this.getResourceBundle().getText("${keypath}")`,
      `{{${keypath}}}`,
      keypath,
    ]
  }

  rewriteKeys(key: string) {
    const regexI8n = /i18n>([\w\d\-.]*)/gm
    const matches = regexI8n.exec(key)
    if (matches && matches.length > 1)
      key = matches[1]
    return key
  }

  enabledParsers = ['properties']

  pathMatcher(): string {
    return 'i18n_{locale}.properties'
  }

  enableFeatures = {
    LinkedMessages: true,
  }

  perferredLocalePaths = [
    'webapp/i18n',
  ]

  perferredKeystyle = 'flat' as const
}

export default UI5Framework
