import { Global, LocaleLoader, LocaleNode, LocaleRecord, LocaleTree, decorateLocale } from '../core'
import { ExtensionModule } from '../modules'
import { TreeItem, ExtensionContext, TreeItemCollapsibleState, TreeDataProvider, EventEmitter, Event, window } from 'vscode'

export type Node = LocaleNode | LocaleRecord | LocaleTree

export class LocaleTreeItem extends TreeItem {
  constructor (
    private ctx: ExtensionContext,
    public readonly node: Node,
    public flatten = false
  ) {
    super('')
  }

  get tooltip (): string {
    return this.node.keypath
  }

  get label (): string {
    if (this.node.type === 'record') {
      return decorateLocale(this.node.locale)
    }
    else {
      return this.flatten
        ? this.node.keypath
        : this.node.keyname
    }
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
    if (this.node.type === 'node' || this.node.type === 'record')
      return this.node.value
    return ''
  }

  get iconPath () {
    if (this.node.type === 'tree')
      return this.ctx.asAbsolutePath('static/icon-module.svg')
    else if (this.node.type === 'node')
      return this.ctx.asAbsolutePath('static/icon-string.svg')
    else if (this.node.type === 'record')
      return this.ctx.asAbsolutePath(`static/flags/${this.node.locale.toLocaleLowerCase()}.svg`)
  }

  get contextValue () {
    const values: string[] = [this.node.type]

    let isSource = false
    const isShadow = this.node.shadow
    if (this.node.type === 'record')
      isSource = this.node.locale === Global.sourceLanguage

    const isTree = this.node.type === 'tree'
    const hasFilepath = this.node.type === 'record' && !!this.node.filepath

    const translatable = !isSource && !isTree && (!isShadow || hasFilepath)
    const openable = !isTree && (!isShadow || hasFilepath)

    if (translatable)
      values.push('translatable')

    if (openable)
      values.push('openable')

    return values.join('-')
  }
}

export class LocalesTreeProvider implements TreeDataProvider<LocaleTreeItem> {
  private loader: LocaleLoader
  private _flatten: boolean
  private _onDidChangeTreeData: EventEmitter<LocaleTreeItem | undefined> = new EventEmitter<LocaleTreeItem | undefined>();
  readonly onDidChangeTreeData: Event<LocaleTreeItem | undefined> = this._onDidChangeTreeData.event;

  constructor (
    private ctx: ExtensionContext,
    public includePaths?: string[],
    flatten = false,
  ) {
    this._flatten = flatten
    this.loader = Global.loader
    Global.onDidChangeLoader((loader) => {
      this.loader = loader
      this.refresh()
    })
  }

  protected refresh (): void {
    this._onDidChangeTreeData.fire()
  }

  getTreeItem (element: LocaleTreeItem): TreeItem {
    return element
  }

  newItem (node: Node) {
    return new LocaleTreeItem(this.ctx, node, this.flatten)
  }

  get flatten () {
    return this._flatten
  }

  set flatten (value) {
    if (this._flatten !== value) {
      this._flatten = value
      this.refresh()
    }
  }

  private filter (node: Node): boolean {
    if (!this.includePaths)
      return true

    for (const includePath of this.includePaths) {
      if (includePath.startsWith(node.keypath))
        return true
    }
    return false
  }

  protected getRoots () {
    const nodes = this.flatten
      ? Object.values(this.loader.flattenLocaleTree)
      : Object.values(this.loader.localeTree.children)

    return nodes
      .filter(node => this.filter(node))
      .map(node => this.newItem(node))
  }

  async getChildren (element?: LocaleTreeItem) {
    if (!element)
      return this.getRoots()

    let nodes: Node[] = []

    if (element.node.type === 'tree')
      nodes = Object.values(element.node.children)

    else if (element.node.type === 'node')
      nodes = Object.values(this.loader.getShadowLocales(element.node))

    return nodes
      .filter(node => this.filter(node))
      .map(r => this.newItem(r))
  }
}

export class LocalesTreeView {
  constructor (ctx: ExtensionContext) {

  }
}

const m: ExtensionModule = (ctx) => {
  const treeDataProvider = new LocalesTreeProvider(ctx)
  window.createTreeView('locales-tree', {
    treeDataProvider,
    // @ts-ignore
    showCollapseAll: true,
  })

  return []
}

export default m
