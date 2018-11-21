import * as vscode from 'vscode'
import KeyDetector from './utils/KeyDetector'
import I18nParser from './utils/I18nParser'

class HintProvider implements vscode.HoverProvider {
  public provideHover(
    document: vscode.TextDocument,
    position: vscode.Position
  ) {
    const key = KeyDetector.getKey(document, position)
    if (!key) return

    const mkStr = I18nParser.transByKey(key, document.fileName)
      .map(item => `**${item.lng.toUpperCase()}:** ${item.str || '-'}`)
      .join('  \n')
    return new vscode.Hover(`${mkStr}`)
  }
}

export default (ctx: vscode.ExtensionContext) => {
  vscode.languages.registerHoverProvider('vue', new HintProvider())
}
