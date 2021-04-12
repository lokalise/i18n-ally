import { TextDocument } from 'vscode'
import { Framework } from './base'
import { LanguageId } from '~/utils'
import { defaultExtractionRules, extractionsParsers } from '~/extraction'
import { Config } from '~/core'

class VueFramework extends Framework {
  id = 'vue'
  display = 'Vue'

  detection = {
    packageJSON: [
      'vue-i18n',
      'vuex-i18n',
      '@panter/vue-i18next',
      'nuxt-i18n',
    ],
  }

  languageIds: LanguageId[] = [
    'vue',
    'vue-html',
    'javascript',
    'typescript',
    'javascriptreact',
    'typescriptreact',
    'ejs',
  ]

  // for visualize the regex, you can use https://regexper.com/
  usageMatchRegex = [
    '(?:i18n[ (\n]\\s*path=|v-t=[\'"`{]|(?:this\\.|\\$|i18n\\.|[^\\w\\d])(?:t|tc|te)\\()\\s*[\'"`]({key})[\'"`]',
  ]

  refactorTemplates(keypath: string, args: string[] = []) {
    console.log(args)
    const params = [`'${keypath}'`, ...args].join(', ')
    return [
      `{{$t(${params})}}`,
      `this.$t(${params})`,
      `$t(${params})`,
      `i18n.t(${params})`,
      // vue-i18n-next
      `{{t(${params})}}`,
      `t(${params})`,
      keypath,
    ]
  }

  enableFeatures = {
    LinkedMessages: true,
  }

  supportAutoExtraction = ['vue', 'html']

  detectHardStrings(doc: TextDocument) {
    const text = doc.getText()

    // TODO: support script block
    const result = extractionsParsers.html.detect(text, defaultExtractionRules, Config.extractParserHTMLOptions)

    return result
  }
}

export default VueFramework
