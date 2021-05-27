import { TextDocument } from 'vscode'
import { Framework } from './base'
import { LanguageId } from '~/utils'
import { DefaultDynamicExtractionsRules, DefaultExtractionRules, DetectionResult, extractionsParsers } from '~/extraction'
import { Config } from '~/core'
import { shiftDetectionPosition } from '~/extraction/parsers/utils'

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
    let params = `'${keypath}'`
    if (args.length)
      params += `, [${args.join(', ')}]`
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

    const result: DetectionResult[] = []

    result.push(
      ...extractionsParsers.html.detect(
        text,
        DefaultExtractionRules,
        DefaultDynamicExtractionsRules,
        Config.extractParserHTMLOptions,
      ),
    )

    // <script>
    const scriptMatch = text.match(/(<script[^>]*?>)([\s\S*]*?)<\/script>/)
    if (scriptMatch && scriptMatch.index != null && scriptMatch.length > 2) {
      const index = scriptMatch.index + scriptMatch[1].length
      const code = scriptMatch[2]

      result.push(
        ...shiftDetectionPosition(
          extractionsParsers.babel.detect(
            code,
            DefaultExtractionRules,
            DefaultDynamicExtractionsRules,
          ),
          index,
        ),
      )
    }

    return result
  }
}

export default VueFramework
