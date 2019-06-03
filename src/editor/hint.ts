import { Common, KeyDetector } from '../core'
import { ExtensionModule } from '../modules'
import { HoverProvider, Position, TextDocument, MarkdownString, languages, Hover } from 'vscode'

class HintProvider implements HoverProvider {
  public provideHover (
    document: TextDocument,
    position: Position
  ) {
    const key = KeyDetector.getKey(document, position)
    if (!key) return

    const trans = Common.loader.getTranslationsByKey(key)

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
      command: 'extension.vue-i18n-ally.config-locales',
    })
    buttons.push({
      name: 'Display Language',
      command: 'extension.vue-i18n-ally.config-display-language',
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
    [
      { language: 'vue', scheme: '*' },
      { language: 'javascript', scheme: '*' },
      { language: 'typescript', scheme: '*' },
    ],
    new HintProvider()
  )
}

export default m
