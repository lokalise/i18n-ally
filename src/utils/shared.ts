// @ts-ignore
import md5 from 'blueimp-md5'
import { ReviewComment } from '~/core/types'

export function getAvatarFromEmail(email?: string) {
  const hash = md5(email || 'noname')
  return `https://www.gravatar.com/avatar/${hash}?s=64&d=${encodeURI(`https://api.adorable.io/avatars/64/${hash}.png`)}`
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
