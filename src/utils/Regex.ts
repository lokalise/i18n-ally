import { CurrentFile } from '../core'
import { KeyInDocument, RewriteKeyContext } from '../core/types'

export function regexFindKeys(text: string, regs: RegExp[], dotEnding = false, rewriteContext?: RewriteKeyContext): KeyInDocument[] {
  const keys = []
  for (const reg of regs) {
    let match = null
    while (match = reg.exec(text)) {
      const matchString = match[0]
      let key = match[1]
      const start = match.index + matchString.lastIndexOf(key)
      const end = start + key.length

      if (key && (dotEnding || !key.endsWith('.'))) {
        key = CurrentFile.loader.rewriteKeys(key, 'reference', rewriteContext)
        keys.push({
          key,
          start,
          end,
        })
      }
    }
  }
  return keys
}
