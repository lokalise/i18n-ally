import { ExtensionContext, TreeItemCollapsibleState } from 'vscode'
import { BaseTreeItem } from '.'
import i18n from '~/i18n'
import { KeyUsage } from '~/core'

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

  // @ts-expect-error
  get contextValue() {
    return `usage_${this.key}`
  }

  set contextValue(_) {}
}
