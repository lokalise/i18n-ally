/* eslint-disable no-useless-constructor */
/* eslint-disable @typescript-eslint/no-parameter-properties */
import * as vscode from 'vscode'
import LocaleLoader, { LocaleTreeNode } from '../core/LocaleLoader'

export class Dependency extends vscode.TreeItem {
  constructor (
    public readonly node: LocaleTreeNode
  ) {
    super(node.key)
  }

  get tooltip (): string {
    return `${this.node.key}`
  }

  get description (): string {
    return this.node.key
  }

  contextValue = 'dependency';
}

export class LocalesTreeProvider implements vscode.TreeDataProvider<Dependency> {
  private _onDidChangeTreeData: vscode.EventEmitter<Dependency | undefined> = new vscode.EventEmitter<Dependency | undefined>();
  readonly onDidChangeTreeData: vscode.Event<Dependency | undefined> = this._onDidChangeTreeData.event;

  constructor (private loader: LocaleLoader) { }

  refresh (): void {
    this._onDidChangeTreeData.fire()
  }

  getTreeItem (element: Dependency): vscode.TreeItem {
    return element
  }

  async getChildren (element?: Dependency) {
    if (element) {
      return []
    }
    else {
      await this.loader.init()
      return Object.values(this.loader.localeTree).map(node => {
        return new Dependency(
          node,
        )
      })
    }
  }
}

export default (ctx: vscode.ExtensionContext) => {
  this.loader = new LocaleLoader()
  const provider = new LocalesTreeProvider(this.loader)
  vscode.window.registerTreeDataProvider('locales-tree', provider)
}
