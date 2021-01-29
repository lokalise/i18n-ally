import { TreeDataProvider, EventEmitter, ExtensionContext, TreeItem, commands, TreeView } from 'vscode'
import { UsageReportTreeItem, UsageReportRootItem, LocationTreeItem } from '../items'
import { Analyst, UsageReport } from '~/core'
import i18n from '~/i18n'

export class UsageReportProvider implements TreeDataProvider<TreeItem> {
  private _onDidChangeTreeData = new EventEmitter<TreeItem | undefined>()
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event
  private usages: UsageReport = { active: [], idle: [], missing: [] }
  view: TreeView<TreeItem> | undefined
  rootItems: TreeItem[] = []

  constructor(
    private ctx: ExtensionContext,
  ) {
    Analyst.onDidUsageReportChanged((u) => {
      this.set(u)
    })
  }

  private set(usages: UsageReport) {
    this.usages = usages
    const enabled = !!(this.usages.active.length || this.usages.idle.length)

    commands.executeCommand('setContext', 'i18n-ally-has-report', enabled)
    this.refresh()
    if (enabled && this.rootItems.length)
      this.view?.reveal(this.rootItems[0])
  }

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined)
  }

  getTreeItem(element: TreeItem): TreeItem {
    return element
  }

  async getChildren(element?: TreeItem) {
    this.rootItems = []
    if (!element) {
      if (this.usages.active.length)
        this.rootItems.push(new UsageReportRootItem(this.ctx, 'active', this.usages.active))
      if (this.usages.idle.length)
        this.rootItems.push(new UsageReportRootItem(this.ctx, 'idle', this.usages.idle))
      if (this.usages.missing.length)
        this.rootItems.push(new UsageReportRootItem(this.ctx, 'missing', this.usages.missing))
      if (!this.rootItems.length)
        this.rootItems.push(new TreeItem(i18n.t('view.usage_report_none')))
    }
    else if (element instanceof UsageReportRootItem) {
      this.rootItems = this.usages[element.key]
        .map(usage => new UsageReportTreeItem(this.ctx, usage, element.key))
    }
    else if (element instanceof UsageReportTreeItem) {
      this.rootItems = await Promise.all(element.usage.occurrences.map(async(o) => {
        const location = await Analyst.getLocationOf(o)
        return new LocationTreeItem(this.ctx, location)
      }))
    }
    return this.rootItems
  }

  getParent() {
    return null
  }
}
