import { TreeItemCollapsibleState } from 'vscode'
import { CurrentFileLocalesTreeProvider } from '../providers'
import { BaseTreeItem } from './Base'
import { HardStringDetectResultItem } from './HardStringDetectResultItem'
import i18n from '~/i18n'
import { CurrentFile } from '~/core'
import { DetectionResult } from '~/extraction'

export class CurrentFileExtractionItem extends BaseTreeItem {
  collapsibleState = TreeItemCollapsibleState.Collapsed
  result: DetectionResult[] | undefined

  constructor(readonly provider: CurrentFileLocalesTreeProvider) {
    super(provider.ctx)
  }

  // @ts-expect-error
  get iconPath() {
    return this.getIcon('symbol-string')
  }

  getLabel() {
    return i18n.t('view.current_file_hard_strings')
  }

  // @ts-expect-error
  get description() {
    const length = CurrentFile.hardStrings?.length
    return length == null ? '?' : length.toString()
  }

  async getChildren() {
    this.result = await CurrentFile.detectHardStrings()

    if (this.result == null)
      return []

    return this.result.map(i => new HardStringDetectResultItem(this.ctx, i))
  }
}
