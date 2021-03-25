import { TreeItemCollapsibleState } from 'vscode'
import { CurrentFileLocalesTreeProvider } from '../providers'
import { BaseTreeItem } from './Base'
import { LocaleTreeItem } from '.'
import { LocaleNode } from '~/core'
import i18n from '~/i18n'

export class CurrentFileNotFoundItem extends BaseTreeItem {
  constructor(public provider: CurrentFileLocalesTreeProvider) {
    super(provider.ctx)
  }

  // @ts-expect-error
  get iconPath() {
    return this.getIcon('warning')
  }

  // @ts-expect-error
  get description() {
    return this.getKeys().length.toString()
  }

  getLabel() {
    return i18n.t('view.current_file_keys_not_found', this.getKeys().length)
  }

  getKeys() {
    return this.provider.pathsNotFound
  }

  // @ts-expect-error
  get collapsibleState() {
    if (this.getKeys().length)
      return TreeItemCollapsibleState.Collapsed
    else
      return TreeItemCollapsibleState.None
  }

  set collapsibleState(_) { }

  async getChildren() {
    return this.getKeys()
      .map(keypath => new LocaleNode({ keypath, shadow: true }))
      .map(node => node && new LocaleTreeItem(this.ctx, node, true))
      .filter(item => item) as LocaleTreeItem[]
  }
}
