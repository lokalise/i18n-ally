import { LanguageId } from '../utils'
import { Framework } from './base'

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
    '\\$_\\([\'"`]({key})[\'"`]',
  ]

  refactorTemplates(keypath: string) {
    return [
      `$_('${keypath}')`,
      keypath,
    ]
  }
}

export default SvelteFramework
