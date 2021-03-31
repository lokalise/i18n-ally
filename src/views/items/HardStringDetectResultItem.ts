import { ExtensionContext, Range, TreeItemCollapsibleState } from 'vscode'
import { BaseTreeItem } from './Base'
import { DetectionResult } from '~/extraction'
import { Commands } from '~/commands'

export class HardStringDetectResultItem extends BaseTreeItem {
  collapsibleState = TreeItemCollapsibleState.None

  constructor(
    readonly ctx: ExtensionContext,
    public readonly detection: DetectionResult,
  ) {
    super(ctx)

    this.label = this.detection.text.trim()

    if (this.detection.editor && this.detection.document) {
      this.command = {
        title: 'Go To',
        command: Commands.go_to_range,
        arguments: [
          this.detection.editor,
          new Range(
            this.detection.document.positionAt(this.detection.fullStart ?? this.detection.start),
            this.detection.document.positionAt(this.detection.fullEnd ?? this.detection.end),
          ),
        ],
      }
    }
  }
}
