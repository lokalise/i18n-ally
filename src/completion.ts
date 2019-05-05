import * as vscode from 'vscode'
import KeyDetector from './utils/KeyDetector'
import i18nFiles from './utils/i18nFiles'

class CompletionProvider implements vscode.CompletionItemProvider {
  public provideCompletionItems (
    document: vscode.TextDocument,
    position: vscode.Position
  ) {
    let key = KeyDetector.getKey(document, position)
    if (!key || !/\.$/.test(key))
      return

    key = key.slice(0, -1)
    const trans = i18nFiles.getTransByKey(document.fileName, key)
    if (!trans)
      return

    const transData = trans[0].data

    if (!transData)
      return

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
      { language: 'typescript', scheme: '*' },
    ],
    new CompletionProvider(),
    '.'
  )
}
