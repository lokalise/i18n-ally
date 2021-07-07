import { ExtensionContext, Range, TextDocument, TreeItemCollapsibleState } from 'vscode'
import { BaseTreeItem } from './Base'
import { DetectionResult } from '~/core/types'
import { Commands } from '~/commands'
import { ExtractTextOptions } from '~/commands/extractString'

export class HardStringDetectResultItem extends BaseTreeItem implements ExtractTextOptions {
  collapsibleState = TreeItemCollapsibleState.None
  text = ''
  isDynamic?: boolean
  range: Range
  rawText?: string
  args?: string[]
  document: TextDocument
  isInsert?: boolean | undefined

  constructor(
    readonly ctx: ExtensionContext,
    public readonly detection: DetectionResult,
  ) {
    super(ctx)

    const document = this.detection.document!

    this.document = document
    this.rawText = detection.text.trim()
    this.isInsert = false
    this.isDynamic = detection.isDynamic

    this.contextValue = 'i18n-ally-hard-string-item'
    this.label = this.detection.text.trim()

    this.range = new Range(
      document.positionAt(this.detection.start),
      document.positionAt(this.detection.end),
    )

    this.command = {
      title: 'Go To',
      command: Commands.go_to_range,
      arguments: [
        this.detection.document,
        this.range,
      ],
    }
  }
}
