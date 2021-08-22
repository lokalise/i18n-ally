import { ProgressRootItem } from './ProgressRootItem'
import { ProgressSubmenuItem } from './ProgressSubmenuItem'
import { Config } from '~/core'

export class ProgressEmptyListItem extends ProgressSubmenuItem {
  constructor(protected root: ProgressRootItem) {
    super(root, 'view.progress_submenu.empty_keys', 'warning')
  }

  // @ts-expect-error
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
