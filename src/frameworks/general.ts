import { TextDocument } from 'vscode'
import { Framework } from './base'
import { LanguageId } from '~/utils'
import { extractionsParsers, DefaultExtractionRules, DefaultDynamicExtractionsRules } from '~/extraction'

class GeneralFramework extends Framework {
  id ='general'
  display = 'General'

  detection = {
    packageJSON: () => true,
  }

  languageIds: LanguageId[] = [
    'javascript',
    'typescript',
    'javascriptreact',
    'typescriptreact',
  ]

  refactorTemplates = () => []
  usageMatchRegex = []

  supportAutoExtraction = [
    'javascript',
    'typescript',
    'javascriptreact',
    'typescriptreact',
  ]

  detectHardStrings(doc: TextDocument) {
    const text = doc.getText()

    return extractionsParsers.babel.detect(
      text,
      DefaultExtractionRules,
      DefaultDynamicExtractionsRules,
    )
  }
}

export default GeneralFramework
