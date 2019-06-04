import { Global, KeyDetector, LanguageSelectors } from '../core'
import { ExtensionModule } from '../modules'
import { HoverProvider, Position, TextDocument, MarkdownString, languages, Hover } from 'vscode'
import { Commands } from '../commands'

class HintProvider implements HoverProvider {
  public provideHover (
    document: TextDocument,
    position: Position
  ) {
    if (!Global.enabled)
      return

    const key = KeyDetector.getKey(document, position)

    if (!key)
      return

    const locales = Global.loader.getTranslationsByKey(key, true)

    const transText = Object
      .values(locales)
      .map(item => `**${item.locale}:** ${item.value || '-'}`)
      .join('\n\n')

    if (!transText)
      return

    const buttons: {name: string; command: string}[] = []

    buttons.push({
      name: 'Change Display Language',
      command: Commands.config_display_language,
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
    LanguageSelectors,
    new HintProvider()
  )
}

export default m
