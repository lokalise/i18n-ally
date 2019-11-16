import * as vscode from 'vscode'
import { Global, KeyDetector, Loader, CurrentFile } from '../core'
import { ExtensionModule } from '../modules'

class CompletionProvider implements vscode.CompletionItemProvider {
  public provideCompletionItems (
    document: vscode.TextDocument,
    position: vscode.Position,
  ) {
    if (!Global.enabled)
      return

    const loader: Loader = CurrentFile.loader
    let key = KeyDetector.getKey(document, position)
    if (!key || !/\.$/.test(key))
      return

    key = key.slice(0, -1)
    const trans = loader.getTreeNodeByKey(key)

    if (!trans || trans.type !== 'tree')
      return

    return Object.values(trans.children).map((node) => {
      return new vscode.CompletionItem(
        node.keyname,
        node.type === 'tree'
          ? vscode.CompletionItemKind.Field
          : vscode.CompletionItemKind.Text,
      )
    })
  }
}

const m: ExtensionModule = (ctx: vscode.ExtensionContext) => {
  return vscode.languages.registerCompletionItemProvider(
    Global.getDocumentSelectors(),
    new CompletionProvider(),
    '.',
  )
}

export default m
