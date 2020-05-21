import { CompletionItemProvider, TextDocument, Position, CompletionItem, CompletionItemKind, ExtensionContext, languages } from 'vscode'
import { Global, KeyDetector, Loader, CurrentFile, LocaleTree, LocaleNode } from '../core'
import { ExtensionModule } from '../modules'

class CompletionProvider implements CompletionItemProvider {
  public provideCompletionItems(
    document: TextDocument,
    position: Position,
  ) {
    if (!Global.enabled)
      return

    const loader: Loader = CurrentFile.loader
    const key = KeyDetector.getKey(document, position, true)

    if (key === undefined)
      return

    if (!key) {
      return Object
        .values(CurrentFile.loader.keys)
        .map((key) => {
          const item = new CompletionItem(key, CompletionItemKind.Text)
          item.detail = loader.getValueByKey(key)
          return item
        })
    }

    let parent = ''

    const parts = key.split('.')

    if (parts.length > 1)
      parent = parts.slice(0, -1).join('.')

    let node: LocaleTree | LocaleNode | undefined

    if (!key)
      node = loader.root

    if (!node)
      node = loader.getTreeNodeByKey(key)

    if (!node && parent)
      node = loader.getTreeNodeByKey(parent)

    if (!node || node.type !== 'tree')
      return

    return Object
      .values(node.children)
      .map((child) => {
        const item = new CompletionItem(
          child.keyname,
          child.type === 'tree'
            ? CompletionItemKind.Field
            : CompletionItemKind.Text,
        )
        item.commitCharacters = ['.']
        item.detail = child.type === 'node' ? child.getValue() : undefined
        return item
      })
  }
}

const m: ExtensionModule = (ctx: ExtensionContext) => {
  return languages.registerCompletionItemProvider(
    Global.getDocumentSelectors(),
    new CompletionProvider(),
    '.', '\'', '"', '`', ':',
  )
}

export default m
