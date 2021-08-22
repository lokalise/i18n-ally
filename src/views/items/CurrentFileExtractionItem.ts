import { TreeItemCollapsibleState, window } from 'vscode'
import { CurrentFileLocalesTreeProvider } from '../providers'
import { BaseTreeItem } from './Base'
import { HardStringDetectResultItem } from './HardStringDetectResultItem'
import i18n from '~/i18n'
import { Config, CurrentFile, Global } from '~/core'

export class CurrentFileExtractionItem extends BaseTreeItem {
  langId = 'unknown'

  constructor(readonly provider: CurrentFileLocalesTreeProvider) {
    super(provider.ctx)

    this.contextValue = 'i18n-ally-hard-string-root'

    this.langId = window.activeTextEditor?.document.languageId || 'unknown'
    if (this.langId && Global.getExtractionFrameworksByLang(this.langId).length) {
      this.collapsibleState = Config.extractAutoDetect
        ? TreeItemCollapsibleState.Expanded
        : TreeItemCollapsibleState.Collapsed
    }
    else {
      this.collapsibleState = TreeItemCollapsibleState.None
    }
  }

  getLabel() {
    return i18n.t('view.current_file_hard_strings')
  }

  // @ts-expect-error
  get description() {
    if (this.collapsibleState === TreeItemCollapsibleState.None) {
      return i18n.t('view.current_file_hard_strings_not_supported', this.langId)
    }
    else {
      const length = CurrentFile.hardStrings?.length
      if (this.collapsibleState === TreeItemCollapsibleState.Collapsed && length == null)
        return i18n.t('view.current_file_hard_strings_expand_to_detect')
      else
        return length == null ? '' : length.toString()
    }
  }

  // @ts-expect-error
  get iconPath() {
    if (this.collapsibleState === TreeItemCollapsibleState.None)
      return this.getIcon('symbol-string-gray')
    else
      return this.getIcon('symbol-string')
  }

  async getChildren() {
    if (this.collapsibleState === TreeItemCollapsibleState.None)
      return []

    await CurrentFile.detectHardStrings()

    return CurrentFile.hardStrings?.map(i => new HardStringDetectResultItem(this.ctx, i)) || []
  }
}
