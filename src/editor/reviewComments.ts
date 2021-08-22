import { comments, CommentController, TextDocument, Range, Disposable, commands, CommentReply, CommentAuthorInformation, Uri, Comment, MarkdownString, CommentMode, CommentThread } from 'vscode'
import { EXT_REVIEW_ID } from '../meta'
import { getAvatarFromEmail } from '../utils/shared'
import { ExtensionModule } from '~/modules'
import { Commands } from '~/commands'
import i18n from '~/i18n'
import { Config, Global, ReviewComment, KeyDetector, ActionSource, Telemetry, TelemetryKey } from '~/core'
import { Log } from '~/utils'

function userToAuthorInfo(user?: {name?: string; email?: string}): CommentAuthorInformation {
  if (!user) {
    return {
      name: i18n.t('review.unknown_user'),
    }
  }
  else {
    return {
      name: user.name || i18n.t('review.unknown_user'),
      iconPath: Uri.parse(getAvatarFromEmail(user.email)),
    }
  }
}

class ReviewReply implements Comment {
  label: string | undefined
  constructor(
    public readonly id: string,
    public body: string | MarkdownString,
    public mode: CommentMode,
    public author: CommentAuthorInformation,
    public thread: CommentThread,
    public contextValue?: string,
  ) {
  }
}

class ReviewCommentProvider implements Disposable {
  private _disposables: Disposable[] = []
  private _cache: Record<string, [Range, {locale: string; keypath: string}][]> = {}
  private _threads: Record<string, CommentThread[]> = {}

  constructor(public readonly controller: CommentController) {
    this._disposables.push(controller)

    controller.commentingRangeProvider = {
      provideCommentingRanges: this.provideCommentingRanges.bind(this),
    }

    this._disposables.push(
      commands.registerCommand(Commands.review_comment, (reply: CommentReply) => {
        this.createComment(reply, 'comment')
      }),
      commands.registerCommand(Commands.review_approve, (reply: CommentReply) => {
        this.createComment(reply, 'approve')
      }),
      commands.registerCommand(Commands.review_request_change, (reply: CommentReply) => {
        this.createComment(reply, 'request_change')
      }),
      commands.registerCommand(Commands.review_resolve, (reply: ReviewReply) => {
        this.resolveComment(reply)
      }),
    )
  }

  typeIcon = {
    'approve': '✅ ',
    'request_change': '❌ ',
    'comment': '',
    '': '',
  }

  typeComment = {
    'approve': `*${i18n.t('review.placeholder.approve')}*`,
    'request_change': `*${i18n.t('review.placeholder.request_change')}*`,
    'comment': `*${i18n.t('review.placeholder.comment')}*`,
    '': '',
  }

  commentsToReply(comments: ReviewComment[], thread: CommentThread) {
    return comments
      .filter(c => !c.resolved)
      .map((c) => {
        const icon = this.typeIcon[c.type || ''] || ''
        const comment = c.comment || this.typeComment[c.type || ''] || this.typeComment.comment
        return new ReviewReply(
          c.id,
          new MarkdownString(icon + comment),
          CommentMode.Preview,
          userToAuthorInfo(c.user),
          thread,
          c.type,
        )
      })
  }

  async createComment(reply: CommentReply, type: 'comment'|'approve'|'request_change') {
    const thread = reply.thread
    const info = this.getThreadInfo(thread)

    if (!info) {
      Log.error(`Invalid range ${thread.range}`)
      return
    }

    Telemetry.track(TelemetryKey.ReviewAddComment, { source: ActionSource.Review })
    await Global.reviews.addComment(info.keypath, info.locale, {
      type,
      comment: reply.text,
      user: Config.reviewUser,
    })

    this.updateThread(thread, info.keypath, info.locale)
  }

  updateThread(thread: CommentThread, keypath: string, locale: string) {
    thread.comments = this.commentsToReply(Global.reviews.getComments(keypath, locale), thread)
  }

  async resolveComment(reply: ReviewReply) {
    const thread = reply.thread
    const info = this.getThreadInfo(thread)

    if (!info) {
      Log.error(`Invalid range ${thread.range}`)
      return
    }

    Telemetry.track(TelemetryKey.ReviewResolveComment, { source: ActionSource.Review })
    await Global.reviews.resolveComment(info.keypath, info.locale, reply.id)

    this.updateThread(thread, info.keypath, info.locale)
  }

  getThreadInfo(thread: CommentThread) {
    const info = this._cache[thread.uri.fsPath]?.find(([r]) => r.start.line === thread.range.start.line)
    if (info)
      return info[1]
  }

  get parsers() {
    return Global.enabledParsers.filter(p => p.annotationSupported)
  }

  async provideCommentingRanges(document: TextDocument): Promise<Range[]> {
    const filepath = document.uri.fsPath

    if (this._threads[filepath]) {
      Disposable.from(...this._threads[filepath]).dispose()
      delete this._threads[filepath]
    }

    if (!Config.reviewEnabled || !Config.reviewGutters)
      return []

    const usages = KeyDetector.getUsages(document)
    if (!usages)
      return []

    const { keys, locale, namespace, type } = usages

    this._cache[filepath] = []
    const cache = this._cache[filepath]

    this._threads[filepath] = []
    const threads = this._threads[filepath]

    const ranges: Range[] = keys.flatMap(({ start, key, end }) => {
      const range = new Range(
        document.positionAt(start),
        document.positionAt(end),
      )
      const keypath = namespace ? `${namespace}.${key}` : key
      cache.push([range, { keypath, locale }])

      const comments = Global.reviews.getComments(keypath, locale)
      if (comments.length) {
        const thread = this.controller.createCommentThread(document.uri, range, [])
        thread.comments = this.commentsToReply(comments, thread)
        threads.push(thread)
      }

      if (type === 'code' && !comments.length)
        return []

      return [range]
    })

    return ranges
  }

  dispose() {
    Disposable.from(...this._disposables).dispose()
  }
}

const reviewComments: ExtensionModule = () => {
  const disposableds = []
  const controller = comments.createCommentController(EXT_REVIEW_ID, i18n.t('review.title'))
  disposableds.push(new ReviewCommentProvider(controller))

  return disposableds
}

export default reviewComments
