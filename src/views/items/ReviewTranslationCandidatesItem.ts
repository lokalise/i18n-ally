import { ExtensionContext } from 'vscode'
import i18n from '../../i18n'
import { TranslationCandidateWithMeta, Commands } from '../../core'
import { BaseTreeItem } from '.'

export class ReviewTranslationCandidatesItem extends BaseTreeItem {
  constructor(
    ctx: ExtensionContext,
    public readonly candidate: TranslationCandidateWithMeta,
  ) {
    super(ctx)
    this.id = candidate.keypath
    this.command = {
      title: i18n.t('review.apply_translation_candidate'),
      command: Commands.review_apply_translation,
      arguments: [this.candidate],
    }
  }

  get description(): string {
    return this.candidate.text
  }

  get iconPath() {
    return this.getIcon('translate')
  }

  getLabel() {
    return this.candidate.keypath
  }
}
