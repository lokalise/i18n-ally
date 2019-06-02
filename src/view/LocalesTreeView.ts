import * as path from 'path'
import * as vscode from 'vscode'
import * as ncp from 'copy-paste'
import { LocaleLoader, LocaleNode, LocaleRecord, LocaleTree } from '../core'
import Common from '../utils/Common'

export class Item extends vscode.TreeItem {
  constructor (
    public readonly node: LocaleNode | LocaleRecord | LocaleTree
  ) {
    super('')
  }

  get tooltip (): string {
    return `${this.node.keypath}`
  }

  get label (): string {
    if (this.node.type === 'record')
      return this.node.locale
    else
      return this.node.keyname
  }

  set label (_) {}

  get collapsibleState () {
    if (this.node.type === 'record')
      return vscode.TreeItemCollapsibleState.None
    else
      return vscode.TreeItemCollapsibleState.Collapsed
  }

  set collapsibleState (_) {}

  get description (): string {
    if (this.node.type === 'node')
      return this.node.value
    if (this.node.type === 'record')
      return this.node.value || '(empty)'
    return ''
  }

  get iconPath () {
    if (this.node.type === 'tree')
      return path.resolve(__dirname, '../../static/icon-module.svg')
    else if (this.node.type === 'node')
      return path.resolve(__dirname, '../../static/icon-string.svg')
    return undefined
  }

  get contextValue () {
    return this.node.type
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
      if (element.node.type === 'tree') {
        return Object.values(element.node.children)
          .map(r => new Item(r))
      }
      if (element.node.type === 'node') {
        return Object.values(this.loader.getShadowLocales(element.node))
          .map(r => new Item(r))
      }
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
    ncp.copy(`$t('${node.keypath}')`, () => {
      vscode.window.showInformationMessage('I18n key copied')
    })
  })

  vscode.commands.registerCommand('extension.vue-i18n-ally.translate-key', async ({ node }: {node: LocaleRecord}) => {
    vscode.window.showWarningMessage('Working in progress...')
    const pendings = await Common.loader.MachineTranslateRecord(node)
    console.log(pendings)
  })
}
