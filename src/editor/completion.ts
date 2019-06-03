import * as vscode from 'vscode'
import KeyDetector from '../core/KeyDetector'
import Common from '../core/Common'

class CompletionProvider implements vscode.CompletionItemProvider {
  public provideCompletionItems (
    document: vscode.TextDocument,
    position: vscode.Position
  ) {
    let key = KeyDetector.getKey(document, position)
    if (!key || !/\.$/.test(key))
      return

    key = key.slice(0, -1)
    const trans = Common.loader.getTreeNodeByKey(key)

    if (!trans || trans.type !== 'tree')
      return

    return Object.values(trans.children).map(node => {
      return new vscode.CompletionItem(
        node.keyname,
        node.type === 'tree'
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
