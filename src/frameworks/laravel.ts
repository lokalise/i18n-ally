import { LanguageId } from '../utils'
import { Framework } from './base'

class LaravelFramework extends Framework {
  id = 'laravel'
  display = 'Laravel'
  monopoly = true

  detection = {
    composerJSON: [
      'laravel/framework',
    ],
  }

  languageIds: LanguageId[] = [
    'php',
    'blade',
  ]

  enabledParsers = ['php']

  // for visualize the regex, you can use https://regexper.com/
  usageMatchRegex = [
    '[^\\w\\d](?:__|trans|@lang|trans_choice)\\([\'"`]({key})[\'"`]',
  ]

  refactorTemplates(keypath: string) {
    return [
      `__('${keypath}')`,
      `trans_choice('${keypath}')`,
      `trans('${keypath}')`,
      `@lang('${keypath}')`,
      keypath,
    ]
  }

  enableFeatures = {
    namespace: true,
  }

  pathMatcher = () => '{locale}/**/{namespace}.{ext}'
}

export default LaravelFramework
