import { Global, KeyDetector, LanguageSelectors, decorateLocale } from '../core'
import { ExtensionModule } from '../modules'
import { HoverProvider, Position, TextDocument, MarkdownString, languages, Hover, ExtensionContext } from 'vscode'

class HintProvider implements HoverProvider {
  constructor (public ctx: ExtensionContext) {}

  public provideHover (document: TextDocument, position: Position) {
    if (!Global.enabled)
      return

    const key = KeyDetector.getKey(document, position)

    if (!key)
      return

    let transTable = Global.visibleLocales
      .map(locale => ({
        locale: decorateLocale(locale),
        value: Global.loader.getValueByKey(key, locale, false) || '-',
      }))
      .map(item => `| | **${item.locale}** | | ${item.value} | |`)
      .join('\n')

    if (!transTable)
      return

    transTable = `| | | | | |\n|---|---:|---|---|---|\n${transTable}\n| | | | | |`

    const markdownText = new MarkdownString(transTable)

    return new Hover(markdownText)
  }
}

const m: ExtensionModule = (ctx) => {
  return languages.registerHoverProvider(
    LanguageSelectors,
    new HintProvider(ctx)
  )
}

export default m
