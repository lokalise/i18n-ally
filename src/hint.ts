import * as vscode from 'vscode'
import KeyDetector from './utils/KeyDetector'
import i18nFiles from './utils/i18nFiles'

class HintProvider implements vscode.HoverProvider {
  public provideHover(
    document: vscode.TextDocument,
    position: vscode.Position
  ) {
    const key = KeyDetector.getKey(document, position)
    if (!key) return

    const mkStr = i18nFiles
      .getTrans(document.fileName, key)
      .map(item => `**${item.lng}:** ${item.data || '-'}`)
      .join('  \n')
    return new vscode.Hover(`${mkStr}`)
  }
}

export default (ctx: vscode.ExtensionContext) => {
  vscode.languages.registerHoverProvider(
    ['vue', 'javascript', 'typescript'],
    new HintProvider()
  )
}
