import { TreeItem, ExtensionContext, TreeDataProvider, EventEmitter, Event } from 'vscode'
import { sortBy } from 'lodash'
import { Node, Loader, CurrentFile } from '../../core'
import { LocaleTreeItem } from '../items/LocaleTreeItem'

export class LocalesTreeProvider implements TreeDataProvider<LocaleTreeItem> {
  protected loader: Loader
  protected name = 'LocalesTreeProvider'
  private _flatten: boolean
  private _onDidChangeTreeData: EventEmitter<LocaleTreeItem | undefined> = new EventEmitter<LocaleTreeItem | undefined>()
  readonly onDidChangeTreeData: Event<LocaleTreeItem | undefined> = this._onDidChangeTreeData.event

  constructor (
    public readonly ctx: ExtensionContext,
    public includePaths?: string[],
    flatten = false,
  ) {
    this._flatten = flatten
    this.loader = CurrentFile.loader

    // let count = 0
    this.loader.onDidChange((src) => {
      // Log.info(`♨ ${this.name} Updated (${count++}) ${src}`)
      this.refresh()
    })
  }

  protected refresh (): void {
    this._onDidChangeTreeData.fire()
  }

  getTreeItem (element: LocaleTreeItem): TreeItem {
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
      .map(node => new LocaleTreeItem(this.ctx, node, this.flatten))
  }

  sort (elements: LocaleTreeItem[]) {
    return sortBy(elements, 'node.type', 'node.keypath')
  }

  async getChildren (element?: LocaleTreeItem) {
    let elements: LocaleTreeItem[] = []

    if (element)
      elements = await element.getChildren()
    else
      elements = this.getRoots()

    elements = elements.filter(el => this.filter(el.node, true))

    return this.sort(elements)
  }
}
