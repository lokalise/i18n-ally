import { ExtensionContext, Range, TreeItemCollapsibleState } from 'vscode'
import { BaseTreeItem } from './Base'
import { DetectionResult } from '~/extraction'
import { Commands } from '~/commands'
import { ExtractTextOptions } from '~/commands/extractText'

export class HardStringDetectResultItem extends BaseTreeItem implements ExtractTextOptions {
  collapsibleState = TreeItemCollapsibleState.None
  filepath: string
  text: string
  range: Range
  rawText?: string
  args?: string[]
  languageId?: string | undefined
  isInsert?: boolean | undefined

  constructor(
    readonly ctx: ExtensionContext,
    public readonly detection: DetectionResult,
  ) {
    super(ctx)

    const document = this.detection.document!

    this.languageId = document.languageId
    this.filepath = document.fileName
    this.text = detection.text
    this.isInsert = false

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
        this.detection.editor,
        this.range,
      ],
    }
  }
}
