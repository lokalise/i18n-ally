import { ProgressSubmenuItem } from './ProgressSubmenuItem'
import { ProgressRootItem } from './ProgressRootItem'

export class ProgressTranslatedListItem extends ProgressSubmenuItem {
  constructor(protected root: ProgressRootItem) {
    super(root, 'view.progress_submenu.translated_keys', 'checkmark')
  }

  getKeys() {
    return this.root.node.translatedKeys
  }
}
