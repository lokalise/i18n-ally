import { TreeDataProvider, EventEmitter, ExtensionContext, TreeItem, Location, Command, TreeItemCollapsibleState, commands } from 'vscode'
import i18n from '../../i18n'
import { KeyUsage, Analyst, LocaleNode, CurrentFile, UsageReport } from '../../core'
import { LocaleTreeItem, BaseTreeItem } from '../items'
import { NodeHelper } from '../../utils'

export class UsageReportTreeItem extends LocaleTreeItem {
  constructor (
    ctx: ExtensionContext,
    public readonly usage: KeyUsage,
  ) {
    super(ctx, CurrentFile.loader.getTreeNodeByKey(usage.keypath) || new LocaleNode({ shadow: true, keypath: usage.keypath }), true)
  }

  get length () {
    return this.usage.occurrences.length
  }

  get label () {
    if (this.length)
      return `${super.label} (${this.length})`
    return super.label
  }

  set label (_) {}

  get contextValue () {
    if (!this.length) {
      const values: string[] = [this.node.type]
      if (NodeHelper.isOpenable(this.node))
        values.push('openable')
      if (NodeHelper.isEditable(this.node))
        values.push('editable')
      return values.join('-')
    }

    return ''
  }

  get collapsibleState () {
    return this.length
      ? TreeItemCollapsibleState.Collapsed
      : TreeItemCollapsibleState.None
  }

  set collapsibleState (_) {}
}

export class UsageReportRootItem extends BaseTreeItem {
  constructor (
    ctx: ExtensionContext,
    public readonly key: 'active'|'idle',
    public readonly count: number,
  ) {
    super(ctx)

    this.iconPath = this.getIcon(key === 'active' ? 'checkmark' : 'warning')
    this.collapsibleState = TreeItemCollapsibleState.Collapsed
  }

  getLabel () {
    return this.key === 'active'
      ? i18n.t('view.usage_keys_in_use', this.count)
      : i18n.t('view.usage_keys_not_in_use', this.count)
  }
}

export class LocationTreeItem extends TreeItem {
  constructor (
    ctx: ExtensionContext,
    public readonly location: Location,
  ) {
    super(location.uri)
  }

  get description () {
    return `${this.location.range.start.line + 1}:${this.location.range.start.character + 1}`
  }

  get command (): Command {
    return {
      title: '',
      command: 'vscode.open',
      arguments: [
        this.location.uri,
        {
          selection: this.location.range,
        },
      ],
    }
  }
}

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
