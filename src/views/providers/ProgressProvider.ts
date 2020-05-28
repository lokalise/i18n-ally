import { TreeItem, ExtensionContext, TreeDataProvider, EventEmitter, Event } from 'vscode'
import throttle from 'lodash/throttle'
import { Global, Loader, CurrentFile } from '../../core'
import { notEmpty } from '../../utils/utils'
import { BaseTreeItem } from '../items/Base'
import { ProgressRootItem } from '../items/ProgressRootItem'
import { EditorPanel } from '../../webview/panel'
import { THROTTLE_DELAY } from '../../meta'

export class ProgressProvider implements TreeDataProvider<BaseTreeItem> {
  protected name = 'ProgressProvider'
  private _onDidChangeTreeData: EventEmitter<BaseTreeItem | undefined> = new EventEmitter<BaseTreeItem | undefined>()
  readonly onDidChangeTreeData: Event<BaseTreeItem | undefined> = this._onDidChangeTreeData.event
  private loader: Loader

  constructor(private ctx: ExtensionContext) {
    this.loader = CurrentFile.loader

    const throttledRefresh = throttle(() => this.refresh(), THROTTLE_DELAY)
    this.loader.onDidChange(throttledRefresh)
    EditorPanel.onDidChange(throttledRefresh)
  }

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined)
  }

  getTreeItem(element: BaseTreeItem): TreeItem {
    return element
  }

  async getChildren(element?: BaseTreeItem) {
    if (element)
      return await element.getChildren()
    return Object.values(Global.allLocales)
      .map(node => this.loader.getCoverage(node))
      .filter(notEmpty)
      .map(cov => new ProgressRootItem(this.ctx, cov))
  }
}
