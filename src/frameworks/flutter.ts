import { Framework } from './base'
import { LanguageId } from '~/utils'

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
    '[^\\w\\d]FlutterI18n\\.(?:plural|translate)\\(\\s*[\\w\\d]+,\\s*[\'"`]({key})[\'"`]',
    '[^\\w\\d]I18n(?:Plural|Text)\\(\\s*[\'"`]({key})[\'"`]',
  ]

  refactorTemplates(keypath: string) {
    return [
      `FlutterI18n.translate(buildContext, "${keypath}")`,
      keypath,
    ]
  }
}

export default FlutterFramework
