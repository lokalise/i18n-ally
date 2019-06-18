import { Global, KeyDetector, LanguageSelectors, decorateLocale, Commands } from '../core'
import { ExtensionModule } from '../modules'
import { HoverProvider, Position, TextDocument, MarkdownString, languages, Hover, ExtensionContext } from 'vscode'
import i18n from '../i18n'

class HintProvider implements HoverProvider {
  constructor (public ctx: ExtensionContext) {}

  static getMarkdownCommand (command: Commands, args: object): string {
    return `command:${command}?${encodeURIComponent(JSON.stringify(args))}`
  }

  public provideHover (document: TextDocument, position: Position) {
    if (!Global.enabled)
      return

    const keypath = KeyDetector.getKey(document, position)
    if (!keypath)
      return

    const node = Global.loader.getTreeNodeByKey(keypath)
    if (!node)
      return

    let transTable = Global.visibleLocales
      .map(locale => {
        const commands = []
        const row = {
          locale: decorateLocale(locale),
          value: Global.loader.getValueByKey(keypath, locale, false) || '-',
          commands: '',
        }
        if (node.type === 'node') {
          commands.push({
            text: i18n.t('command.edit_key'),
            command: HintProvider.getMarkdownCommand(Commands.edit_key, { keypath, locale }),
          })
        }
        row.commands = commands.map(c => `[\`${c.text}\`](${c.command})`).join(' ')
        return row
      })
      .map(item => `| | **${item.locale}** | | ${item.value} | ${item.commands} |`)
      .join('\n')

    if (!transTable)
      return

    transTable = `| | | | | |\n|---|---:|---|---|---:|\n${transTable}\n| | | | | |`

    const markdownText = new MarkdownString(transTable)
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
