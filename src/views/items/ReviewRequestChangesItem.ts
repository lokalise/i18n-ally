import { ExtensionContext, Uri } from 'vscode'
import { ReviewCommentWithMeta } from '../../core'
import { getAvatarFromEmail } from '../../utils/shared'
import i18n from '../../i18n'
import { BaseTreeItem } from '.'

export class ReviewRequestChangesItem extends BaseTreeItem {
  constructor(
    ctx: ExtensionContext,
    public readonly comment: ReviewCommentWithMeta,
  ) {
    super(ctx)
    this.id = comment.id
  }

  get iconPath() {
    return Uri.parse(getAvatarFromEmail(this.comment.user?.email))
  }

  getLabel() {
    return this.comment.user?.name || i18n.t('review.unknown_user')
  }

  get description() {
    let comment = this.comment.comment
    if (comment)
      comment += '  '
    return `▸ "${this.comment.keypath}"`
  }

  set description(_) {}
}
