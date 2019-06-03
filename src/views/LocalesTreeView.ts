import * as vscode from 'vscode'
import * as clipboardy from 'clipboardy'
import { Common, LocaleLoader, LocaleNode, LocaleRecord, LocaleTree } from '../core'
import { ExtensionModule } from '../modules'

export class Item extends vscode.TreeItem {
  constructor (
    private ctx: vscode.ExtensionContext,
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
      return this.ctx.asAbsolutePath('static/icon-module.svg')
    else if (this.node.type === 'node')
      return this.ctx.asAbsolutePath('static/icon-string.svg')
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
  private ctx: vscode.ExtensionContext

  constructor (ctx: vscode.ExtensionContext) {
    this.ctx = ctx
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
          .map(r => new Item(this.ctx, r))
      }
      if (element.node.type === 'node') {
        return Object.values(this.loader.getShadowLocales(element.node))
          .map(r => new Item(this.ctx, r))
      }
      return []
    }
    else {
      return Object.values(this.loader.localeTree.children)
        .map(node => new Item(this.ctx, node))
    }
  }
}

const m: ExtensionModule = (ctx) => {
  const provider = new LocalesTreeProvider(ctx)
  vscode.window.registerTreeDataProvider('locales-tree', provider)
  vscode.commands.registerCommand('extension.vue-i18n-ally.copy-key', ({ node }: {node: LocaleNode}) => {
    clipboardy.writeSync(`$t('${node.keypath}')`)
    vscode.window.showInformationMessage('I18n key copied')
  })

  vscode.commands.registerCommand('extension.vue-i18n-ally.translate-key', async ({ node }: {node: LocaleRecord}) => {
    try {
      const pending = await Common.loader.MachineTranslateRecord(node)
      if (pending) {
        await Common.loader.writeToFile(pending)
        vscode.window.showInformationMessage('Translation saved!')
      }
    }
    catch (err) {
      vscode.window.showErrorMessage(err.toString())
    }
  })
}

export default m
