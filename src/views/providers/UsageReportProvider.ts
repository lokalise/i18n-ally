import { TreeDataProvider, EventEmitter, ExtensionContext, TreeItem, commands } from 'vscode'
import { Analyst, UsageReport } from '../../core'
import { UsageReportTreeItem, UsageReportRootItem, LocationTreeItem } from '../items'

export class UsageReportProvider implements TreeDataProvider<TreeItem> {
  private _onDidChangeTreeData = new EventEmitter<TreeItem | undefined>()
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event
  private usages: UsageReport = { active: [], idle: [] }
  // readonly view: TreeView<UsageReportTreeItem | LocationTreeItem>

  constructor (
    private ctx: ExtensionContext,
  ) {
    Analyst.onDidUsageReportChanged((u) => {
      this.set(u)
    })
  }

  private set (usages: UsageReport) {
    this.usages = usages
    const enabled = !!(this.usages.active.length || this.usages.idle.length)

    commands.executeCommand('setContext', 'i18n-ally-has-report', enabled)
    this.refresh()
    // if (enabled)
    //  this.view.reveal(this.items[0])
  }

  refresh (): void {
    this._onDidChangeTreeData.fire()
  }

  getTreeItem (element: TreeItem): TreeItem {
    return element
  }

  async getChildren (element?: TreeItem) {
    if (!element) {
      const items: UsageReportRootItem[] = []

      if (this.usages.active.length)
        items.push(new UsageReportRootItem(this.ctx, 'active', this.usages.active.length))
      if (this.usages.idle.length)
        items.push(new UsageReportRootItem(this.ctx, 'idle', this.usages.idle.length))

      return items
    }
    if (element instanceof UsageReportRootItem) {
      return this.usages[element.key]
        .map(usage => new UsageReportTreeItem(this.ctx, usage))
    }
    if (element instanceof UsageReportTreeItem) {
      return await Promise.all(element.usage.occurrences.map(async (o) => {
        const location = await Analyst.getLocationOf(o)
        return new LocationTreeItem(this.ctx, location)
      }))
    }
    else {
      return []
    }
  }
}
