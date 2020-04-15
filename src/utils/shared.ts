// @ts-ignore
import md5 from 'blueimp-md5'
import { nanoid } from 'nanoid'
import { ReviewComment } from '../core/types'

export function getAvatarFromEmail(email?: string) {
  if (email)
    return `https://www.gravatar.com/avatar/${md5(email)}`
  else
    return `https://i.pravatar.cc/150?u=${nanoid()}`
}

export function getCommentState(comments: ReviewComment[]) {
  if (!comments.length)
    return undefined

  const approve = comments.filter(i => i.type === 'approve').length
  const request_change = comments.filter(i => i.type === 'request_change').length

  if (approve && !request_change)
    return 'approve'
  else if (!approve && request_change)
    return 'request_change'
  else if (approve && request_change)
    return 'conflict'
  else
    return 'comment'
}
