import { ProgressRootItem } from './ProgressRootItem'
import { ProgressSubmenuItem } from './ProgressSubmenuItem'
import { Config } from '~/core'

export class ProgressMissingListItem extends ProgressSubmenuItem {
  constructor(protected root: ProgressRootItem) {
    super(root, 'view.progress_submenu.missing_keys', 'icon-unknown')
  }

  // @ts-expect-error
  get contextValue() {
    const values: string[] = []
    if (this.node.locale !== Config.sourceLanguage)
      values.push('translatable')
    values.push('fulfillable')
    return values.join('-')
  }

  getKeys() {
    return this.root.node.missingKeys
  }
}
