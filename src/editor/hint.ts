import { Common, KeyDetector } from '../core'
import { ExtensionModule } from '../modules'
import { HoverProvider, Position, TextDocument, MarkdownString, languages, Hover } from 'vscode'
import language_selectors from './language_selectors'
import { Command } from '../commands'

class HintProvider implements HoverProvider {
  public provideHover (
    document: TextDocument,
    position: Position
  ) {
    const key = KeyDetector.getKey(document, position)

    if (!key)
      return

    const trans = Common.loader.getTranslationsByKey(key)

    if (!trans)
      return

    const transText = Object.values(trans.locales)
      .map(item => `**${item.locale}:** ${item.value || '-'}`)
      .join('\n\n')

    const buttons: {name: string; command: string}[] = []

    if (transText) {
      buttons.push({
        name: 'Translator',
        command: 'extension.vue-i18n-ally.file-translator',
      })
    }
    buttons.push({
      name: 'Config',
      command: Command.config_locales,
    })
    buttons.push({
      name: 'Display Language',
      command: Command.config_display_language,
    })

    const buttonsMarkdown = buttons.map(btn => `[${btn.name}](command:${btn.command})`).join(' | ')
    const markdownText = new MarkdownString(
      `${transText || key}\n\n---\n\n${buttonsMarkdown}`
    )
    markdownText.isTrusted = true

    return new Hover(markdownText)
  }
}

const m: ExtensionModule = () => {
  return languages.registerHoverProvider(
    language_selectors,
    new HintProvider()
  )
}

export default m
