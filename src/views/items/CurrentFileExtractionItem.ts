import { TreeItemCollapsibleState, window } from 'vscode'
import { CurrentFileLocalesTreeProvider } from '../providers'
import { BaseTreeItem } from './Base'
import { HardStringDetectResultItem } from './HardStringDetectResultItem'
import i18n from '~/i18n'
import { CurrentFile, Global } from '~/core'
import { DetectionResult } from '~/extraction'

export class CurrentFileExtractionItem extends BaseTreeItem {
  result: DetectionResult[] | undefined
  langId = 'unknown'

  constructor(readonly provider: CurrentFileLocalesTreeProvider) {
    super(provider.ctx)

    this.langId = window.activeTextEditor?.document.languageId || 'unknown'
    if (this.langId && Global.getExtractionFrameworksByLang(this.langId).length)
      this.collapsibleState = TreeItemCollapsibleState.Collapsed
    else
      this.collapsibleState = TreeItemCollapsibleState.None
    this.updateDescription()
  }

  getLabel() {
    return i18n.t('view.current_file_hard_strings')
  }

  updateDescription() {
    if (this.collapsibleState === TreeItemCollapsibleState.None) {
      this.iconPath = this.getIcon('symbol-string-gray')
      this.description = i18n.t('view.current_file_hard_strings_not_supported', this.langId)
    }
    else {
      this.iconPath = this.getIcon('symbol-string')
      const length = CurrentFile.hardStrings?.length
      this.description = length == null ? '?' : length.toString()
    }
  }

  async getChildren() {
    if (this.collapsibleState === TreeItemCollapsibleState.None)
      return []

    this.result = await CurrentFile.detectHardStrings()

    if (this.result == null)
      return []

    return this.result.map(i => new HardStringDetectResultItem(this.ctx, i))
  }
}
