import { ExtensionContext, TreeItemCollapsibleState } from 'vscode'
import { TranslationCandidateWithMeta } from '../../core'
import i18n from '../../i18n'
import { ReviewTranslationCandidatesItem } from './ReviewTranslationCandidatesItem'
import { BaseTreeItem } from '.'

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
