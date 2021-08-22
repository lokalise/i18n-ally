import { ExtensionContext } from 'vscode'
import { FeedbackItemDefintion } from '../providers'
import { BaseTreeItem } from './Base'
import { Commands } from '~/commands'

export class FeedbackItem extends BaseTreeItem {
  constructor(ctx: ExtensionContext, define: FeedbackItemDefintion) {
    super(ctx)
    this.getLabel = () => define.text
    this.iconPath = define.icon.startsWith('$')
      ? define.icon
      : this.getIcon(define.icon)

    if (define.desc)
      this.tooltip = define.desc
    if (define.command) {
      this.command = define.command
    }
    else if (define.url) {
      this.command = {
        title: define.text,
        command: Commands.open_url,
        arguments: [define.url],
      }
    }
  }
}
