import { KeyInDocument } from '../core/types'

export function regexFindKeys (text: string, regs: RegExp[]): KeyInDocument[] {
  const keys = []
  for (const reg of regs) {
    let match = null
    while (match = reg.exec(text)) {
      const matchString = match[0]
      const key = match[1]
      const start = match.index + matchString.indexOf(key)
      const end = start + key.length
      keys.push({
        key,
        start,
        end,
      })
    }
  }
  return keys
}
