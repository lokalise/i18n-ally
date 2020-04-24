import { ExtensionContext, TreeItemCollapsibleState } from 'vscode'
import { ReviewCommentWithMeta } from '../../core'
import i18n from '../../i18n'
import { ReviewSuggestionsItem } from './ReviewSuggestionsItem'
import { BaseTreeItem } from '.'

export class ReviewSuggestions extends BaseTreeItem {
  constructor(
    ctx: ExtensionContext,
    public readonly comments: ReviewCommentWithMeta[],
  ) {
    super(ctx)
    this.id = 'review_suggestions'
    this.collapsibleState = TreeItemCollapsibleState.Collapsed
  }

  get iconPath() {
    return this.getIcon('review-suggestions', false)
  }

  getLabel() {
    return `${i18n.t('review.suggestions')} (${this.comments.length})`
  }

  async getChildren() {
    return this.comments.map(c => new ReviewSuggestionsItem(this.ctx, c))
  }
}
