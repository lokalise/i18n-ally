import { KeyInDocument } from '../core/types'

export function regexFindKeys (text: string, regs: RegExp[], namespaces: string[] = []): KeyInDocument[] {
  const namespace = namespaces[0] // TODO: enumerate multiple namespaces

  const keys = []
  for (const reg of regs) {
    let match = null
    while (match = reg.exec(text)) {
      const matchString = match[0]
      const key = match[1]
      const start = match.index + matchString.indexOf(key)
      const end = start + key.length
      let keypath = key

      if (namespace) {
        if (key.includes(':'))
          keypath = key.replace(/:/g, '.')
        else
          keypath = `${namespace}.${key}`
      }

      keys.push({
        key: keypath,
        start,
        end,
      })
    }
  }
  return keys
}
