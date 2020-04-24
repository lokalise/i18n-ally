import { LanguageId } from '../utils'
import { Framework } from './base'

class FlutterFramework extends Framework {
  id= 'flutter'
  display= 'Flutter'

  detection = {
    pubspecYAML: [
      'flutter_i18n',
    ],
  }

  languageIds: LanguageId[] = [
    'dart',
  ]

  // for visualize the regex, you can use https://regexper.com/
  usageMatchRegex = [
    '[^\\w\\d]FlutterI18n\\.(?:plural|translate)\\([\\w\\d]+,\\s?[\'"`]({key})[\'"`]',
  ]

  refactorTemplates(keypath: string) {
    return [
      `FlutterI18n.translate(buildContext, "${keypath}")`,
      keypath,
    ]
  }
}

export default FlutterFramework
