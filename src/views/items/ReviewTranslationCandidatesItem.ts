import { ExtensionContext } from 'vscode'
import { BaseTreeItem } from '.'
import i18n from '~/i18n'
import { TranslationCandidateWithMeta } from '~/core'
import { Commands } from '~/commands'

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

  // @ts-expect-error
  get description(): string {
    return this.candidate.text
  }

  // @ts-expect-error
  get iconPath() {
    return this.getIcon('translate')
  }

  getLabel() {
    return this.candidate.keypath
  }
}
