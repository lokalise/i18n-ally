import { Framework } from '../base'
import { LanguageId } from '../../utils'

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

  // for visualize the regex, you can use https://regexper.com/
  keyMatchReg = [
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

  pathMatcher = () => '{locale}/**/{namespace}.php'
}

export default LaravelFramework
