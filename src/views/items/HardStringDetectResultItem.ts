import { ExtensionContext, TreeItemCollapsibleState } from 'vscode'
import { BaseTreeItem } from './Base'
import { DetectionResult } from '~/extraction'

export class HardStringDetectResultItem extends BaseTreeItem {
  collapsibleState = TreeItemCollapsibleState.None

  constructor(
    readonly ctx: ExtensionContext,
    public readonly detection: DetectionResult,
  ) {
    super(ctx)
  }

  getLabel() {
    return this.detection.text.trim()
  }
}
