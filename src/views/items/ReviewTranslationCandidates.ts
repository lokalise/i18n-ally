import { ExtensionContext } from 'vscode'
import { TranslationCandidate } from '../../core'
import i18n from '../../i18n'
import { BaseTreeItem } from '.'

export class ReviewTranslationCandidates extends BaseTreeItem {
  constructor(
    ctx: ExtensionContext,
    public readonly comments: TranslationCandidate[],
  ) {
    super(ctx)
  }

  get iconPath() {
    return this.getIcon('translate-colored', false)
  }

  getLabel() {
    return `${i18n.t('review.translation_candidates')} (${this.comments.length})`
  }
}
