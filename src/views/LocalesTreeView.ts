import * as clipboardy from 'clipboardy'
import { Common, LocaleLoader, LocaleNode, LocaleRecord, LocaleTree } from '../core'
import { ExtensionModule } from '../modules'
import { TreeItem, ExtensionContext, TreeItemCollapsibleState, TreeDataProvider, EventEmitter, Event, window, commands } from 'vscode'

export class Item extends TreeItem {
  constructor (
    private ctx: ExtensionContext,
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
      return TreeItemCollapsibleState.None
    else
      return TreeItemCollapsibleState.Collapsed
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

export class LocalesTreeProvider implements TreeDataProvider<Item> {
  private _onDidChangeTreeData: EventEmitter<Item | undefined> = new EventEmitter<Item | undefined>();
  readonly onDidChangeTreeData: Event<Item | undefined> = this._onDidChangeTreeData.event;
  private loader: LocaleLoader
  private ctx: ExtensionContext

  constructor (ctx: ExtensionContext) {
    this.ctx = ctx
    this.loader = Common.loader
    this.loader.addEventListener('changed', () => this.refresh())
  }

  refresh (): void {
    this._onDidChangeTreeData.fire()
  }

  getTreeItem (element: Item): TreeItem {
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

export class LocalesTreeView {
  constructor (ctx: ExtensionContext) {
    const treeDataProvider = new LocalesTreeProvider(ctx)
    window.createTreeView('locales-tree', { treeDataProvider })
  }
}

const m: ExtensionModule = (ctx) => {
  const provider = new LocalesTreeProvider(ctx)
  window.registerTreeDataProvider('locales-tree', provider)
  commands.registerCommand('extension.vue-i18n-ally.copy-key', ({ node }: {node: LocaleNode}) => {
    clipboardy.writeSync(`$t('${node.keypath}')`)
    window.showInformationMessage('I18n key copied')
  })

  commands.registerCommand('extension.vue-i18n-ally.translate-key', async ({ node }: {node: LocaleRecord}) => {
    try {
      const pending = await Common.loader.MachineTranslateRecord(node)
      if (pending) {
        await Common.loader.writeToFile(pending)
        window.showInformationMessage('Translation saved!')
      }
    }
    catch (err) {
      window.showErrorMessage(err.toString())
    }
  })

  commands.registerCommand('extension.vue-i18n-ally.edit-key', async ({ node }: {node: LocaleRecord}) => {
    try {
      const newvalue = await window.showInputBox({
        value: node.value,
        prompt: `Edit key "${node.keypath}" on ${node.locale}`,
      })

      if (newvalue !== undefined && newvalue !== node.value) {
        await Common.loader.writeToFile({
          value: newvalue,
          keypath: node.keypath,
          filepath: node.filepath,
          locale: node.locale,
        })
      }
    }
    catch (err) {
      window.showErrorMessage(err.toString())
    }
  })
}

export default m
