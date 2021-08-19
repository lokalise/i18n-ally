import { TextDocument } from 'vscode'
import { LanguageId, Log } from '../utils'
import { Framework } from './base'
import { DetectionResult } from '~/core'

class FluentVueFramework extends Framework {
  id = 'fluent-vue'
  display = 'fluent-vue'

  detection = {
    packageJSON: [
      'fluent-vue',
    ],
  }

  languageIds: LanguageId[] = [
    'vue',
    'vue-html',
    'javascript',
    'typescript',
    'ejs',
  ]

  enabledParsers = ['ftl']

  // for visualize the regex, you can use https://regexper.com/
  usageMatchRegex = [
    // Directive
    'v-t:({key})[\\s\\n=]',
    // Component
    'i18n[ (\\n]\\s*path=[\'"`]({key})[\'"`]',
    // Instance methods
    '(?:(?:this\\.|[^\\w\\d])(?:\\$t|\\$ta)\\()\\s*[\'"`]({key})[\'"`]',
    // fluent methods
    '(?:fluent\\.(?:format|formatAttrs)\\()\\s*[\'"`]({key})[\'"`]',
  ]

  refactorTemplates(keypath: string, args?: string[], document?: TextDocument, detection?: DetectionResult): string[] {
    let params = `'${keypath}'`
    if (args?.length)
      params += `, [${args.join(', ')}]`

    Log.warn(detection?.source ?? 'no-source')

    switch (detection?.source) {
      case 'html-inline':
        return [`{{ $t(${params}) }}`]
      case 'html-attribute':
        return [`$t(${params})`]
      case 'js-string':
        return [`$t(${params})`, `this.$t(${params})`]
    }

    return [
      `{{ $t(${params}) }}`,
      `this.$t(${params})`,
      `$t(${params})`,
      keypath,
    ]
  }
}

export default FluentVueFramework
