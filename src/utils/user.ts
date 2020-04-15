import md5 from 'blueimp-md5'
import { nanoid } from 'nanoid'

export function getAvatarFromEmail(email?: string) {
  if (email)
    return `https://www.gravatar.com/avatar/${md5(email)}`
  else
    return `https://i.pravatar.cc/150?u=${nanoid()}`
}
