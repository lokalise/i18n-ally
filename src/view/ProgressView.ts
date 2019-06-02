import * as vscode from 'vscode'
import LocaleLoader, { Coverage } from '../core/LocaleLoader'
import Common from '../utils/Common'

export class Item extends vscode.TreeItem {
  constructor (
    public readonly node: Coverage
  ) {
    super(node.locale)
  }

  get description (): string {
    const percent = (this.node.translated / this.node.total * 100).toFixed(2)
    return `${percent}% - ${this.node.translated}/${this.node.total}`
  }

  contextValue = 'progressItem'
}

export class ProgressProvider implements vscode.TreeDataProvider<Item> {
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
    if (element)
      return []

    else
      return Object.values(this.loader.locales).map(node => new Item(this.loader.getCoverage(node)))
  }
}

export default (ctx: vscode.ExtensionContext) => {
  const provider = new ProgressProvider(Common.loader)
  vscode.window.registerTreeDataProvider('locales-progress', provider)
}
