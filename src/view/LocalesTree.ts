import * as vscode from 'vscode'
import LocaleLoader, { LocaleTreeNode, LocaleRecord } from '../core/LocaleLoader'
import Common from '../utils/Common'

export class Item extends vscode.TreeItem {
  constructor (
    public readonly node: LocaleTreeNode | LocaleRecord
  ) {
    super(node.key)
  }

  get isNode () {
    return this.node instanceof LocaleTreeNode
  }

  get tooltip (): string {
    return `${this.node.key}`
  }

  get label (): string {
    if (this.node instanceof LocaleTreeNode)
      return this.node.key
    else
      return this.node.locale
  }

  set label (_) {}

  get collapsibleState () {
    if (this.isNode)
      return vscode.TreeItemCollapsibleState.Collapsed
    else
      return vscode.TreeItemCollapsibleState.None
  }

  set collapsibleState (_) {}

  get description (): string {
    return this.node.value
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
      if (element.node instanceof LocaleTreeNode)
        return Object.values(element.node.locales).map(r => new Item(r))
    }
    else {
      return Object.values(this.loader.localeTree).map(node => new Item(node))
    }
  }
}

export default (ctx: vscode.ExtensionContext) => {
  const provider = new LocalesTreeProvider(Common.loader)
  vscode.window.registerTreeDataProvider('locales-tree', provider)
}
