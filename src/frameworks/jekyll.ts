import { Framework } from './base'
import { LanguageId } from '~/utils'

class JekyllFramework extends Framework {
  id = 'jekyll'
  display = 'Jekyll'

  detection = {
    gemfile: [
      'jekyll-multiple-languages-plugin',
    ],
  }

  languageIds: LanguageId[] = [
    'html',
  ]

  usageMatchRegex = [
    '\\{\\%\\s+t\\s+({key})\\s+\\%\\}',
  ]

  perferredKeystyle = 'nested' as const

  refactorTemplates(keypath: string) {
    return [
      `{% t ${keypath} %}`,
      keypath,
    ]
  }
}

export default JekyllFramework
