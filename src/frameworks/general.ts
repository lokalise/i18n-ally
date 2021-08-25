import { TextDocument } from 'vscode'
import { Framework } from './base'
import { LanguageId } from '~/utils'
import { extractionsParsers, DefaultExtractionRules, DefaultDynamicExtractionsRules } from '~/extraction'
import { Config } from '~/core'

class GeneralFramework extends Framework {
  id = 'general'
  display = 'General'

  detection = {
    packageJSON: () => true,
  }

  languageIds: LanguageId[] = [
    'javascript',
    'typescript',
    'javascriptreact',
    'typescriptreact',
    'html',
  ]

  refactorTemplates(keypath: string, args: string[] = []) {
    let params = `'${keypath}'`
    if (args.length)
      params += `, [${args.join(', ')}]`
    return [
      `$t(${params})`,
      keypath,
    ]
  }

  usageMatchRegex = []

  supportAutoExtraction = [
    'javascript',
    'typescript',
    'javascriptreact',
    'typescriptreact',
    'html',
  ]

  detectHardStrings(doc: TextDocument) {
    const lang = doc.languageId
    const text = doc.getText()

    if (lang === 'html') {
      return extractionsParsers.html.detect(
        text,
        DefaultExtractionRules,
        DefaultDynamicExtractionsRules,
        Config.extractParserHTMLOptions,
        // <script>
        script => extractionsParsers.babel.detect(
          script,
          DefaultExtractionRules,
          DefaultDynamicExtractionsRules,
          Config.extractParserBabelOptions,
        ),
      )
    }
    else {
      return extractionsParsers.babel.detect(
        text,
        DefaultExtractionRules,
        DefaultDynamicExtractionsRules,
      )
    }
  }
}

export default GeneralFramework
