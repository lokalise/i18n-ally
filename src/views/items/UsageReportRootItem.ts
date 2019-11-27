import { ExtensionContext, TreeItemCollapsibleState } from 'vscode'
import i18n from '../../i18n'
import { BaseTreeItem } from '.'

export class UsageReportRootItem extends BaseTreeItem {
  constructor (ctx: ExtensionContext, public readonly key: 'active' | 'idle', public readonly count: number) {
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
