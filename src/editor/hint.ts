import { Global, KeyDetector, LanguageSelectors, decorateLocale, Commands, escapeMarkdown, GlyphChars, NodeHelper } from '../core'
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

    let node = Global.loader.getTreeNodeByKey(keypath)
    if (!node)
      node = Global.loader.getShadowNodeByKey(keypath)

    const locales = Global.loader.getTranslationsByKey(keypath)

    const transTable = Global.visibleLocales
      .map(locale => {
        const commands = []
        const row = {
          locale: decorateLocale(locale),
          value: escapeMarkdown(Global.loader.getValueByKey(keypath, locale, false) || '-'),
          commands: '',
        }
        const record = locales[locale]
        if (record) {
          if (NodeHelper.isTranslatable(record)) {
            commands.push({
              text: i18n.t('command.translate_key'),
              icon: GlyphChars.Translate,
              command: HintProvider.getMarkdownCommand(Commands.translate_key, { keypath, locale }),
            })
          }
          if (NodeHelper.isEditable(record)) {
            commands.push({
              text: i18n.t('command.edit_key'),
              icon: GlyphChars.Pencil,
              command: HintProvider.getMarkdownCommand(Commands.edit_key, { keypath, locale }),
            })
          }
          if (NodeHelper.isOpenable(record)) {
            commands.push({
              text: i18n.t('command.open_key'),
              icon: GlyphChars.ArrowUpRight,
              command: HintProvider.getMarkdownCommand(Commands.open_key, { keypath, locale }),
            })
          }
        }
        row.commands = commands.map(c => `[${c.icon}](${c.command} "${c.text}")`).join(' ')
        return row
      })
      .map(item => `| | **${item.locale}** | | ${item.value} | ${item.commands} |`)
      .join('\n')

    if (!transTable)
      return

    const markdown = `| | | | | |\n|---|---:|---|---|---:|\n${transTable}\n| | | | | |`

    const markdownText = new MarkdownString(markdown)
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
