import { Config } from '../../core'
import { ProgressRootItem } from './ProgressRootItem'
import { ProgressSubmenuItem } from './ProgressSubmenuItem'

export class ProgressEmptyListItem extends ProgressSubmenuItem {
  constructor(protected root: ProgressRootItem) {
    super(root, 'view.progress_submenu.empty_keys', 'warning')
  }

  get contextValue() {
    const values: string[] = []
    if (this.node.locale !== Config.sourceLanguage)
      values.push('translatable')
    return values.join('-')
  }

  getKeys() {
    return this.root.node.emptyKeys
  }
}
