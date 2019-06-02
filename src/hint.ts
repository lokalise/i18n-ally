import * as vscode from 'vscode'
import KeyDetector from './utils/KeyDetector'
import Common from './utils/Common'

class HintProvider implements vscode.HoverProvider {
  public provideHover (
    document: vscode.TextDocument,
    position: vscode.Position
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
    const markdownText = new vscode.MarkdownString(
      `${transText || key}\n\n---\n\n${buttonsMarkdown}`
    )
    markdownText.isTrusted = true

    return new vscode.Hover(markdownText)
  }
}

export default (ctx: vscode.ExtensionContext) => {
  return vscode.languages.registerHoverProvider(
    [
      { language: 'vue', scheme: '*' },
      { language: 'javascript', scheme: '*' },
      { language: 'typescript', scheme: '*' },
    ],
    new HintProvider()
  )
}
