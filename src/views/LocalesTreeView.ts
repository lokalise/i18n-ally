import { TreeItem, ExtensionContext, TreeItemCollapsibleState, TreeDataProvider, EventEmitter, Event, window } from 'vscode'
import { sortBy } from 'lodash'
import { Node, Loader, Translator, CurrentFile } from '../core'
import { ExtensionModule } from '../modules'
import { decorateLocale, NodeHelper, Log, getFlagFilename } from '../utils'
import { BasicTreeView } from './Basic'

export class LocaleTreeView extends BasicTreeView {
  constructor (
    ctx: ExtensionContext,
    public readonly node: Node,
    public flatten = false,
    public readonly displayLocale?: string,
    public readonly listedLocales?: string[]
  ) {
    super(ctx)
  }

  get tooltip (): string {
    return this.node.keypath
  }

  getLabel (): string {
    if (this.node.type === 'record') {
      return decorateLocale(this.node.locale)
    }
    else {
      return this.flatten
        ? this.node.keypath
        : this.node.keyname
    }
  }

  get collapsibleState () {
    if (this.node.type === 'record')
      return TreeItemCollapsibleState.None
    else
      return TreeItemCollapsibleState.Collapsed
  }

  set collapsibleState (_) {}

  get description (): string {
    if (this.node.type === 'node')
      return this.node.getValue(this.displayLocale) || this.node.value
    if (this.node.type === 'record')
      return this.node.value
    return ''
  }

  getIcon (name: string) {
    return {
      light: this.ctx.asAbsolutePath(`res/light/${name}.svg`),
      dark: this.ctx.asAbsolutePath(`res/dark/${name}.svg`),
    }
  }

  get iconPath () {
    if (Translator.isTranslating(this.node))
      return this.getIcon('loading')

    if (this.node.type === 'record') {
      return this.ctx.asAbsolutePath(`res/flags/${getFlagFilename(this.node.locale)}`)
    }

    else if (this.node.shadow) {
      return this.ctx.asAbsolutePath('res/icon-unknown.svg')
    }
    else if (this.node.type === 'tree') {
      if (this.node.isCollection)
        return this.getIcon('collection')
      else
        return this.getIcon('namespace')
    }
    else if (this.node.type === 'node') {
      if (this.description)
        return this.getIcon('string')

      else
        return this.getIcon('missing')
    }
  }

  get contextValue () {
    const values: string[] = [this.node.type]

    if (NodeHelper.isTranslatable(this.node))
      values.push('translatable')

    if (NodeHelper.isOpenable(this.node))
      values.push('openable')

    if (NodeHelper.isEditable(this.node))
      values.push('editable')

    return values.join('-')
  }

  async getChildren () {
    let nodes: Node[] = []

    if (this.node.type === 'tree')
      nodes = Object.values(this.node.children)

    else if (this.node.type === 'node')
      nodes = Object.values(CurrentFile.loader.getShadowLocales(this.node, this.listedLocales))

    const items = nodes
      .map(node => new LocaleTreeView(this.ctx, node, false))

    return items
  }
}

export class LocalesTreeProvider implements TreeDataProvider<LocaleTreeView> {
  protected loader: Loader
  protected name = 'LocalesTreeProvider'
  private _flatten: boolean
  private _onDidChangeTreeData: EventEmitter<LocaleTreeView | undefined> = new EventEmitter<LocaleTreeView | undefined>()
  readonly onDidChangeTreeData: Event<LocaleTreeView | undefined> = this._onDidChangeTreeData.event

  constructor (
    public readonly ctx: ExtensionContext,
    public includePaths?: string[],
    flatten = false,
  ) {
    this._flatten = flatten
    this.loader = CurrentFile.loader

    let count = 0
    this.loader.onDidChange((src) => {
      Log.info(`♨ ${this.name} Updated (${count++}) ${src}`)
      this.refresh()
    })
  }

  protected refresh (): void {
    this._onDidChangeTreeData.fire()
  }

  getTreeItem (element: LocaleTreeView): TreeItem {
    return element
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

  private filter (node: Node, root = false): boolean {
    if (!this.includePaths)
      return true

    for (const includePath of this.includePaths) {
      if (includePath.startsWith(node.keypath))
        return true
      if (!root && node.keypath.startsWith(includePath))
        return true
    }
    return false
  }

  protected getRoots () {
    if (!this.loader)
      return []

    const nodes = this.flatten
      ? Object.values(this.loader.flattenLocaleTree)
      : Object.values(this.loader.root.children)

    return nodes
      .map(node => new LocaleTreeView(this.ctx, node, this.flatten))
  }

  sort (elements: LocaleTreeView[]) {
    return sortBy(elements, 'node.type', 'node.keypath')
  }

  async getChildren (element?: LocaleTreeView) {
    let elements: LocaleTreeView[] = []

    if (element)
      elements = await element.getChildren()
    else
      elements = this.getRoots()

    elements = elements.filter(el => this.filter(el.node, true))

    return this.sort(elements)
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
