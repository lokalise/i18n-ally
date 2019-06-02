import * as vscode from 'vscode'
import LocaleLoader, { LocaleTreeNode, LocaleRecord, LocaleTree } from '../core/LocaleLoader'
import Common from '../utils/Common'

export class Item extends vscode.TreeItem {
  constructor (
    public readonly node: LocaleTreeNode | LocaleRecord | LocaleTree
  ) {
    super('')
  }

  get isNode () {
    return this.node instanceof LocaleTreeNode
  }

  get tooltip (): string {
    if (this.node instanceof LocaleTree)
      return `${this.node.keypath}`
    return `${this.node.key}`
  }

  get label (): string {
    if (this.node instanceof LocaleTreeNode)
      return this.node.key
    else if (this.node instanceof LocaleRecord)
      return this.node.locale
    else
      return this.node.keyname
  }

  set label (_) {}

  get collapsibleState () {
    if (this.node instanceof LocaleRecord)
      return vscode.TreeItemCollapsibleState.None
    else
      return vscode.TreeItemCollapsibleState.Collapsed
  }

  set collapsibleState (_) {}

  get description (): string {
    if (this.node instanceof LocaleRecord || this.node instanceof LocaleTreeNode)
      return this.node.value
    return ''
  }

  contextValue = 'dependency';
}

export class LocalesTreeProvider implements vscode.TreeDataProvider<Item> {
  private _onDidChangeTreeData: vscode.EventEmitter<Item | undefined> = new vscode.EventEmitter<Item | undefined>();
  readonly onDidChangeTreeData: vscode.Event<Item | undefined> = this._onDidChangeTreeData.event;

  constructor (private loader: LocaleLoader) { }

  refresh (): void {
    this._onDidChangeTreeData.fire()
  }

  getTreeItem (element: Item): vscode.TreeItem {
    return element
  }

  async getChildren (element?: Item) {
    if (element) {
      if (element.node instanceof LocaleTree)
        return Object.values(element.node.children).map(r => new Item(r))
      if (element.node instanceof LocaleTreeNode)
        return Object.values(element.node.locales).map(r => new Item(r))
      return []
    }
    else {
      return Object.values(this.loader.localeTree.children).map(node => new Item(node))
    }
  }
}

export default (ctx: vscode.ExtensionContext) => {
  const provider = new LocalesTreeProvider(Common.loader)
  vscode.window.registerTreeDataProvider('locales-tree', provider)
}
