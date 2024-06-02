import { TextDocument } from 'vscode'
import { Framework, ScopeRange } from './base'
import { LanguageId } from '~/utils'
import { Config } from '~/core'
import { extractionsParsers, DefaultExtractionRules, DefaultDynamicExtractionsRules } from '~/extraction'

class NextTranslateFramework extends Framework {
  id= 'next-translate'
  display= 'Next Translate'

  detection= {
    packageJSON: [
      'next-translate',
    ],
  }

  languageIds: LanguageId[] = [
    'javascript',
    'typescript',
    'javascriptreact',
    'typescriptreact',
    'ejs',
  ]

  // for visualize the regex, you can use https://regexper.com/
  usageMatchRegex = [
    '[^\\w\\d]t\\s*\\(\\s*[\'"`]({key})[\'"`]',
    '[^\\w\\d]t`({key})`',
    'Trans\\s+i18nKey=[\'"`]({key})[\'"`]',
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
        {},
        (path, recordIgnore) => {
          const callee = path.get('callee')
          if (callee.node.name === 't' || callee.node.name === 'Trans')
            recordIgnore(path)
        },
      )
    }
  }

  refactorTemplates(keypath: string) {
    const pathWithoutNamespace = keypath.substring(keypath.indexOf('.') + 1, keypath.length)
    return [
      `{t('${pathWithoutNamespace}')}`,
      `t('${pathWithoutNamespace}')`,
    ]
  }

  // useTranslation
  getScopeRange(document: TextDocument): ScopeRange[] | undefined {
    if (![
      'javascript',
      'typescript',
      'javascriptreact',
      'typescriptreact',
    ].includes(document.languageId))
      return

    const ranges: ScopeRange[] = []
    const text = document.getText()
    const reg = /(?:useTranslation\(\s*|getT\(.*,\s*)(?:['"`](.*?)['"`])?/g

    for (const match of text.matchAll(reg)) {
      if (match?.index == null)
        continue

      // end previous scope
      if (ranges.length)
        ranges[ranges.length - 1].end = match.index

      // start new scope if namespace provides
      if (match[1]) {
        ranges.push({
          start: match.index,
          end: text.length,
          namespace: match[1] as string,
        })
      }
    }

    return ranges
  }

  pathMatcher() {
    return '{locale}/{namespace}.json'
  }

  preferredKeystyle = 'nested' as const

  enableFeatures = {
    namespace: true,
  }
}

export default NextTranslateFramework
