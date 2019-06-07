import { Global, KeyDetector, LanguageSelectors, decorateLocale } from '../core'
import { ExtensionModule } from '../modules'
import { HoverProvider, Position, TextDocument, MarkdownString, languages, Hover, ExtensionContext } from 'vscode'
import { Commands } from '../commands'

class HintProvider implements HoverProvider {
  constructor (public ctx: ExtensionContext) {}

  public provideHover (
    document: TextDocument,
    position: Position
  ) {
    if (!Global.enabled)
      return

    const key = KeyDetector.getKey(document, position)

    if (!key)
      return

    let transTable = Global.visibleLocales
      .map(locale => ({ locale, value: Global.loader.getValueByKey(key, locale, false) }))
      .map(item => `| **${decorateLocale(item.locale)}** | ${item.value || '-'} |`)
      .join('\n')

    if (!transTable)
      return

    transTable = `|   |   |\n|---:|---|\n${transTable}`

    const buttons: {name: string; command: string}[] = []

    buttons.push({
      name: 'Change Display Language',
      command: Commands.config_display_language,
    })

    const buttonsMarkdown = buttons.map(btn => `[${btn.name}](command:${btn.command})`).join(' | ')
    const markdownText = new MarkdownString(
      `${transTable || key}\n\n---\n\n${buttonsMarkdown}`
    )
    markdownText.isTrusted = true

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
