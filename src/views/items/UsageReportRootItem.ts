import { ExtensionContext, TreeItemCollapsibleState } from 'vscode'
import { KeyUsage } from '../../core'
import i18n from '../../i18n'
import { BaseTreeItem } from '.'

export class UsageReportRootItem extends BaseTreeItem {
  public readonly count: number

  constructor(
    ctx: ExtensionContext,
    public readonly key: 'active' | 'idle' | 'missing',
    public readonly keys: KeyUsage[],
  ) {
    super(ctx)
    this.iconPath = this.getIcon({
      active: 'checkmark',
      idle: 'warning',
      missing: 'icon-unknown',
    }[this.key])
    this.count = keys.length
    this.collapsibleState = TreeItemCollapsibleState.Collapsed
    this.id = `usage-root-${this.key}`
  }

  getLabel() {
    return {
      active: i18n.t('view.usage_keys_in_use', this.count),
      idle: i18n.t('view.usage_keys_not_in_use', this.count),
      missing: i18n.t('view.usage_keys_missing', this.count),
    }[this.key]
  }

  get contextValue() {
    return `usage_${this.key}`
  }

  set contextValue(_) {}
}
