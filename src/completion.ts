import * as vscode from 'vscode'
import KeyDetector from './utils/KeyDetector'
import i18nFiles from './utils/i18nFiles'

class completionProvider implements vscode.CompletionItemProvider {
  public provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position
  ) {
    let key = KeyDetector.getKey(document, position)
    if (!key || !/\.$/.test(key)) return

    key = key.slice(0, -1)
    const transData = i18nFiles.getTrans(document.fileName, key)[0].data

    if (!transData) return

    return Object.keys(transData).map(key => {
      return new vscode.CompletionItem(
        key,
        typeof transData[key] === 'object'
          ? vscode.CompletionItemKind.Field
          : vscode.CompletionItemKind.Text
      )
    })
  }
}

export default (ctx: vscode.ExtensionContext) => {
  return vscode.languages.registerCompletionItemProvider(
    [
      { language: 'vue', scheme: '*' },
      { language: 'javascript', scheme: '*' },
      { language: 'typescript', scheme: '*' }
    ],
    new completionProvider(),
    '.'
  )
}
