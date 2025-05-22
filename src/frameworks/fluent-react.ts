import type { TextDocument } from 'vscode'
import { Framework } from './base'
import type { ScopeRange } from './base'
import type { LanguageId } from '~/utils'
import { extractionsParsers, DefaultExtractionRules, DefaultDynamicExtractionsRules } from '~/extraction'

class FluentReactFramework extends Framework {
  id = 'fluent-react'
  display = '@fluent/react'

  detection = {
    packageJSON: [
      '@fluent/react',
    ],
  }

  languageIds: LanguageId[] = [
    'javascript',
    'typescript',
    'javascriptreact',
    'typescriptreact',
  ]

  enabledParsers = ['ftl']

  usageMatchRegex = [
    '<Localized\\s+id=[\'"`]({key})[\'"`]',
    'useLocalization\\(\\)[^}]*?getString\\([\'"`]({key})[\'"`]',
  ]

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

  refactorTemplates(keypath: string) {
    return [
      `<Localized id="${keypath}">`,
      `getString('${keypath}')`,
      keypath,
    ]
  }

  getScopeRange(document: TextDocument): ScopeRange[] | undefined {
    if (!this.languageIds.includes(document.languageId as LanguageId))
      return

    const ranges: ScopeRange[] = []
    const text = document.getText()

    // Add namespace from LocalizationProvider
    const regProvider = /<LocalizationProvider[^>]*?l10n={[^}]*?bundles:\s*\[[^\]]*?['"`]([^'"`]+)['"`]/g

    for (const match of text.matchAll(regProvider)) {
      if (typeof match.index !== 'number')
        continue

      if (match[1]) {
        ranges.push({
          start: match.index,
          end: match.index + match[0].length,
          namespace: match[1],
        })
      }
    }

    return ranges
  }
}

export default FluentReactFramework
