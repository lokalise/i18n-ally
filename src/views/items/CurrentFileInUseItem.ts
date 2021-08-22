import { TreeItemCollapsibleState } from 'vscode'
import { CurrentFileLocalesTreeProvider } from '../providers'
import { BaseTreeItem } from './Base'
import { LocaleTreeItem } from '.'
import { CurrentFile } from '~/core'
import i18n from '~/i18n'

export class CurrentFileInUseItem extends BaseTreeItem {
  constructor(readonly provider: CurrentFileLocalesTreeProvider) {
    super(provider.ctx)
  }

  // @ts-expect-error
  get iconPath() {
    return this.getIcon('checkmark')
  }

  getLabel() {
    return i18n.t('view.current_file_keys_in_use')
  }

  // @ts-expect-error
  get description() {
    return this.getKeys().length.toString()
  }

  getKeys() {
    return this.provider.pathsInUse
  }

  // @ts-expect-error
  get collapsibleState() {
    if (this.getKeys().length)
      return TreeItemCollapsibleState.Expanded
    else
      return TreeItemCollapsibleState.None
  }

  set collapsibleState(_) { }

  async getChildren() {
    return this.getKeys()
      .map(key => CurrentFile.loader.getTreeNodeByKey(key))
      .map(node => node && new LocaleTreeItem(this.ctx, node, true))
      .filter(item => item) as LocaleTreeItem[]
  }
}
