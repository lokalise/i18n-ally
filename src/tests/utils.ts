import { regexFindKeys } from '../utils/Regex'

export function forRegex(regs: RegExp[]) {
  return {
    getFirstKey(text: string) {
      return regexFindKeys(text, regs)[0]?.key
    },

    getKeysInfo(text: string) {
      return regexFindKeys(text, regs)
    },
  }
}
