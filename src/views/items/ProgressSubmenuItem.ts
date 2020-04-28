import { TreeItemCollapsibleState } from 'vscode'
import { Config, CurrentFile } from '../../core'
import i18n from '../../i18n'
import { LocaleTreeItem } from './LocaleTreeItem'
import { ProgressBaseItem } from './ProgressBaseItem'
import { ProgressRootItem } from './ProgressRootItem'

export abstract class ProgressSubmenuItem extends ProgressBaseItem {
  constructor(protected root: ProgressRootItem, public readonly labelKey: string, public readonly icon?: string) {
    super(root.ctx, root.node)
    this.id = `progress-${this.node.locale}-${labelKey}`
  }

  get iconPath() {
    if (this.icon)
      return this.getIcon(this.icon)
  }

  getLabel() {
    return i18n.t(this.labelKey) + this.getSuffix()
  }

  getSuffix() {
    return ` (${this.getKeys().length})`
  }

  abstract getKeys(): string[]
  get collapsibleState() {
    if (this.getKeys().length)
      return TreeItemCollapsibleState.Collapsed
    else
      return TreeItemCollapsibleState.None
  }

  set collapsibleState(_) { }
  async getChildren() {
    const locales = Array.from(new Set([this.node.locale, Config.sourceLanguage]))
    return this.getKeys()
      .map(key => CurrentFile.loader.getTreeNodeByKey(key))
      .map(node => node && new LocaleTreeItem(this.ctx, node, true, this.node.locale, locales))
      .filter(item => item) as LocaleTreeItem[]
  }
}
