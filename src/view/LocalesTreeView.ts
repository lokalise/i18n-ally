import * as path from 'path'
import * as vscode from 'vscode'
import * as ncp from 'copy-paste'
import LocaleLoader, { LocaleNode, LocaleRecord, LocaleTree } from '../core/LocaleLoader'
import Common from '../utils/Common'

export class Item extends vscode.TreeItem {
  constructor (
    public readonly node: LocaleNode | LocaleRecord | LocaleTree
  ) {
    super('')
  }

  get isNode () {
    return this.node instanceof LocaleNode
  }

  get tooltip (): string {
    if (this.node instanceof LocaleTree)
      return `${this.node.keypath}`
    return `${this.node.key}`
  }

  get label (): string {
    if (this.node instanceof LocaleNode)
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
    if (this.node instanceof LocaleRecord || this.node instanceof LocaleNode)
      return this.node.value
    return ''
  }

  get iconPath () {
    if (this.node instanceof LocaleTree)
      return path.resolve(__dirname, '../../static/icon-module.svg')
    else if (this.node instanceof LocaleNode)
      return path.resolve(__dirname, '../../static/icon-string.svg')
    return undefined
  }

  get contextValue () {
    if (this.node instanceof LocaleTree)
      return 'tree'
    else if (this.node instanceof LocaleNode)
      return 'node'
    return 'record'
  }
}

export class LocalesTreeProvider implements vscode.TreeDataProvider<Item> {
  private _onDidChangeTreeData: vscode.EventEmitter<Item | undefined> = new vscode.EventEmitter<Item | undefined>();
  readonly onDidChangeTreeData: vscode.Event<Item | undefined> = this._onDidChangeTreeData.event;
  private loader: LocaleLoader

  constructor () {
    this.loader = Common.loader
    this.loader.addEventListener('changed', () => this.refresh())
  }

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
      if (element.node instanceof LocaleNode)
        return Object.values(element.node.locales).map(r => new Item(r))
      return []
    }
    else {
      return Object.values(this.loader.localeTree.children).map(node => new Item(node))
    }
  }
}

export default (ctx: vscode.ExtensionContext) => {
  const provider = new LocalesTreeProvider()
  vscode.window.registerTreeDataProvider('locales-tree', provider)
  vscode.commands.registerCommand('extension.vue-i18n-ally.copy-key', ({ node }: {node: LocaleNode}) => {
    ncp.copy(`$t('${node.key}')`, () => {
      vscode.window.showInformationMessage('I18n key copied')
    })
  })
}
