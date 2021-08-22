import { Framework } from './base'
import { LanguageId } from '~/utils'

class PhpGettextFramework extends Framework {
  id = 'php-gettext'
  display = 'PHP Gettext'
  monopoly = true

  detection = {}

  languageIds: LanguageId[] = [
    'php',
  ]

  enabledParsers = ['po']

  // for visualize the regex, you can use https://regexper.com/
  usageMatchRegex = [
    '[^\\w\\d](?:gettext)\\([\'"`]({key})[\'"`]',
  ]

  refactorTemplates(keypath: string) {
    return [
      `gettext('${keypath}')`,
      keypath,
    ]
  }

  enableFeatures = {
    namespace: true,
  }
}

export default PhpGettextFramework
