import { TextDocument } from 'vscode'
import { Framework } from './base'
import { LanguageId } from '~/utils'
import { DetectionResult, Config } from '~/core'
import { extractionsParsers, DefaultExtractionRules, DefaultDynamicExtractionsRules } from '~/extraction'
import { shiftDetectionPosition } from '~/extraction/parsers/utils'

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

  supportAutoExtraction = ['svelte']

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

export default SvelteFramework
