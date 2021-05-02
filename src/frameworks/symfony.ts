import path from 'path'
import { Framework } from './base'
import { LanguageId } from '~/utils'
import { Config, Global } from '~/core'

class SymfonyFramework extends Framework {
  id= 'symfony'
  display= 'Symfony'

  detection = {
    composerJSON: [
      'symfony/translation',
    ],
  }

  languageIds: LanguageId[] = [
    'php',
    'twig'
  ]

  enabledParsers = ['yaml']

  pathMatcher = () => "**/*.{locale}.{ext}"

  usageMatchRegex = [
    '->trans\\(\\s*[\'"`]({key})[\'"`]', // php syntax: ->trans('my_key')
    '[`\'"]({key})[`\'"][\\s\\n]*\\|[\\s\\n]*trans' // twig syntax: {{ 'my_key'|trans }}
  ]

  refactorTemplates(keypath: string) {
    return [
      `$this->trans("${keypath}")`,
      keypath,
    ]
  }
}

export default SymfonyFramework
