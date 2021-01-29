import { Framework } from './base'
import { LanguageId } from '~/utils'

class SvelteFramework extends Framework {
  id= 'svelte'
  display= 'Svelte'

  detection= {
    packageJSON: [
      'svelte-i18n',
    ],
  }

  languageIds: LanguageId[] = [
    'javascript',
    'typescript',
    'svelte',
  ]

  // for visualize the regex, you can use https://regexper.com/
  usageMatchRegex = [
    '\\$[_t]\\([\'"`]({key})[\'"`]',
  ]

  refactorTemplates(keypath: string) {
    return [
      `$_('${keypath}')`,
      keypath,
    ]
  }
}

export default SvelteFramework
