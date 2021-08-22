import { ExtensionContext, Uri } from 'vscode'
import { BaseTreeItem } from '.'
import { getAvatarFromEmail } from '~/utils'
import { ReviewCommentWithMeta } from '~/core'
import i18n from '~/i18n'
import { Commands } from '~/commands'

export class ReviewSuggestionsItem extends BaseTreeItem {
  constructor(
    ctx: ExtensionContext,
    public readonly comment: ReviewCommentWithMeta,
  ) {
    super(ctx)
    this.id = `suggestion_${comment.id}`
    this.command = {
      title: i18n.t('command.open_in_editor'),
      command: Commands.review_apply_suggestion,
      arguments: [comment],
    }
  }

  // @ts-expect-error
  get iconPath() {
    return Uri.parse(getAvatarFromEmail(this.comment.user?.email))
  }

  getLabel() {
    return this.comment.user?.name || i18n.t('review.unknown_user')
  }

  // @ts-expect-error
  get description() {
    let suggestion = this.comment.suggestion
    if (suggestion)
      suggestion += '  '
    return `${suggestion}・ "${this.comment.keypath}"`
  }

  set description(_) {}
}
