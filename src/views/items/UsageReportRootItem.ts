import { ExtensionContext, TreeItemCollapsibleState } from 'vscode'
import i18n from '../../i18n'
import { BaseTreeItem } from '.'

export class UsageReportRootItem extends BaseTreeItem {
  constructor (ctx: ExtensionContext, public readonly key: 'active' | 'idle' | 'missing', public readonly count: number) {
    super(ctx)
    this.iconPath = this.getIcon({
      active: 'checkmark',
      idle: 'warning',
      missing: 'icon-unknown',
    }[this.key])
    this.collapsibleState = TreeItemCollapsibleState.Collapsed
  }

  getLabel () {
    return {
      active: i18n.t('view.usage_keys_in_use', this.count),
      idle: i18n.t('view.usage_keys_not_in_use', this.count),
      missing: i18n.t('view.usage_keys_missing', this.count),
    }[this.key]
  }
}
