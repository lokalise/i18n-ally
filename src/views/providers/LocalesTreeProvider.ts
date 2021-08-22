import { TreeItem, ExtensionContext, TreeDataProvider, EventEmitter, Event } from 'vscode'
import { sortBy, throttle } from 'lodash'
import { LocaleTreeItem } from '../items/LocaleTreeItem'
import { EditorPanel } from '../../webview/panel'
import { THROTTLE_DELAY } from '../../meta'
import { resolveFlattenRootKeypath } from '~/utils'
import { Node, Loader, CurrentFile, LocaleTree, LocaleNode } from '~/core'

export class LocalesTreeProvider implements TreeDataProvider<LocaleTreeItem> {
  protected loader: Loader
  protected name = 'LocalesTreeProvider'
  private _flatten: boolean
  private _onDidChangeTreeData: EventEmitter<LocaleTreeItem | undefined> = new EventEmitter<LocaleTreeItem | undefined>()
  readonly onDidChangeTreeData: Event<LocaleTreeItem | undefined> = this._onDidChangeTreeData.event

  constructor(
    public readonly ctx: ExtensionContext,
    public includePaths?: string[],
    flatten = false,
  ) {
    this._flatten = flatten
    this.loader = CurrentFile.loader

    const throttledRefresh = throttle(() => this.refresh(), THROTTLE_DELAY)
    this.loader.onDidChange(throttledRefresh)
    EditorPanel.onDidChange(throttledRefresh)
  }

  protected refresh(): void {
    this._onDidChangeTreeData.fire(undefined)
  }

  getTreeItem(element: LocaleTreeItem): TreeItem {
    return element
  }

  get flatten() {
    return this._flatten
  }

  set flatten(value) {
    if (this._flatten !== value) {
      this._flatten = value
      this.refresh()
    }
  }

  private filter(node: Node, root = false): boolean {
    if (!this.includePaths)
      return true

    const flatten = resolveFlattenRootKeypath(node.keypath)

    for (const includePath of this.includePaths) {
      if (includePath.startsWith(node.keypath))
        return true
      if (!root && node.keypath.startsWith(includePath))
        return true
      if (this.flatten && flatten !== node.keypath && flatten === includePath)
        return true
    }
    return false
  }

  protected filterNodes(nodes: (LocaleTree | LocaleNode)[]) {
    return nodes
  }

  protected getRoots() {
    if (!this.loader)
      return []

    const nodes = this.flatten
      ? Object.values(this.loader.flattenLocaleTree)
      : Object.values(this.loader.root.children)

    return nodes
      .filter(node => this.filter(node, true))
      .map(node => new LocaleTreeItem(this.ctx, node, this.flatten))
  }

  sort(elements: LocaleTreeItem[]) {
    return sortBy(elements, 'node.type', 'node.keypath')
  }

  async getChildren(element?: LocaleTreeItem) {
    let elements: LocaleTreeItem[] = []

    if (element)
      elements = await element.getChildren(node => this.filter(node, true))
    else
      elements = this.getRoots()

    return this.sort(elements)
  }
}
