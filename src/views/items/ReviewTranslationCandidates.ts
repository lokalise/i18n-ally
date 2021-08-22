import { ExtensionContext, TreeItemCollapsibleState } from 'vscode'
import { ReviewTranslationCandidatesItem } from './ReviewTranslationCandidatesItem'
import { BaseTreeItem } from '.'
import i18n from '~/i18n'
import { TranslationCandidateWithMeta } from '~/core'

export class ReviewTranslationCandidates extends BaseTreeItem {
  constructor(
    ctx: ExtensionContext,
    public readonly candidates: TranslationCandidateWithMeta[],
  ) {
    super(ctx)
    this.id = 'review-translation-candidates'
    this.collapsibleState = TreeItemCollapsibleState.Collapsed
    this.contextValue = 'translation-candidate'
  }

  // @ts-expect-error
  get iconPath() {
    return this.getIcon('translate-colored', false)
  }

  getLabel() {
    return `${i18n.t('review.translation_candidates')} (${this.candidates.length})`
  }

  async getChildren() {
    return this.candidates.map(c => new ReviewTranslationCandidatesItem(this.ctx, c))
  }
}
