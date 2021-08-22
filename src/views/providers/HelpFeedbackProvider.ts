import { TreeItem, ExtensionContext, TreeDataProvider, Command } from 'vscode'
import { FeedbackItem } from '../items/FeedbackItem'
import Links from '~/links'
import { Commands } from '~/commands'
import i18n from '~/i18n'

export interface FeedbackItemDefintion {
  text: string
  desc?: string
  icon: string
  url?: string
  command?: Command
}

export class HelpFeedbackProvider implements TreeDataProvider<FeedbackItem> {
  constructor(
    private ctx: ExtensionContext,
  ) {}

  getTreeItem(element: FeedbackItem): TreeItem {
    return element
  }

  async getChildren(element?: FeedbackItem) {
    if (element)
      return [] // no child

    return ([{
      text: i18n.t('feedback.document'),
      icon: 'help-documentation',
      url: Links.document,
    }, {
      text: i18n.t('feedback.github'),
      icon: 'help-star',
      url: Links.github,
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
    }]).map(i => new FeedbackItem(this.ctx, i))
  }
}
