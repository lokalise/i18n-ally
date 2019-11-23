import { TreeItem, ExtensionContext } from 'vscode'
import { Commands } from '../../core'
import { FeedbackItemDefintion } from '../providers/HelpFeedbackProvider'

export class FeedbackItem extends TreeItem {
  constructor (ctx: ExtensionContext, define: FeedbackItemDefintion) {
    super(define.text)
    this.iconPath = {
      light: ctx.asAbsolutePath(`res/light/${define.icon}.svg`),
      dark: ctx.asAbsolutePath(`res/dark/${define.icon}.svg`),
    }
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
