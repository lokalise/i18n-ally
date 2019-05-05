import * as vscode from 'vscode'
import KeyDetector from './utils/KeyDetector'
import i18nFiles from './utils/i18nFiles'

class HintProvider implements vscode.HoverProvider {
  public provideHover (
    document: vscode.TextDocument,
    position: vscode.Position
  ) {
    const key = KeyDetector.getKey(document, position)
    if (!key) return

    const transData = i18nFiles.getTransByKey(document.fileName, key) || []

    const transText = transData
      .map(item => `**${item.lng}:** ${item.data || '-'}`)
      .join('  \n')

    const transBtn = transText
      ? '[翻译](command:extension.vue-i18n-ally.transCenter) | '
      : ''
    const markdownText = new vscode.MarkdownString(
      `${transText ||
        key}\n\n---\n\n${transBtn}[配置](command:extension.vue-i18n-ally.config)`
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
