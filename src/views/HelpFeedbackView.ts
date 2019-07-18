import { TreeItem, ExtensionContext, TreeDataProvider, window, Command } from 'vscode'
import { ExtensionModule } from '../modules'
import i18n from '../i18n'
import { Commands } from '../core'
import Links from '../links'

export interface FeedbackItemDefintion {
  text: string
  desc?: string
  icon: string
  url?: string
  command?: Command
}

const items: FeedbackItemDefintion[] = [{
  text: i18n.t('feedback.document'),
  icon: 'help-documentation',
  url: Links.document,
}, {
  text: i18n.t('feedback.github'),
  icon: 'help-star',
  url: Links.github,
}, {
  text: i18n.t('feedback.twitter_feedback'),
  icon: 'help-tweet',
  url: Links.twitter,
}, {
  text: i18n.t('feedback.report_issues'),
  icon: 'help-report-issue',
  url: Links.issues,
}, {
  text: i18n.t('feedback.support'),
  icon: 'help-heart',
  command: {
    title: i18n.t('feedback.support'),
    command: Commands.support,
  },
}]

export class FeedbackItem extends TreeItem {
  constructor (
    ctx: ExtensionContext,
    define: FeedbackItemDefintion
  ) {
    super(define.text)
    this.iconPath = {
      light: ctx.asAbsolutePath(`static/light/${define.icon}.svg`),
      dark: ctx.asAbsolutePath(`static/dark/${define.icon}.svg`),
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

export class HelpFeedbackProvider implements TreeDataProvider<FeedbackItem> {
  constructor (
    private ctx: ExtensionContext,
  ) {}

  getTreeItem (element: FeedbackItem): TreeItem {
    return element
  }

  async getChildren (element?: FeedbackItem) {
    if (element)
      return [] // no child

    return items.map(i => new FeedbackItem(this.ctx, i))
  }
}

const m: ExtensionModule = (ctx: ExtensionContext) => {
  const provider = new HelpFeedbackProvider(ctx)
  return window.registerTreeDataProvider('help-feedback', provider)
}

export default m
