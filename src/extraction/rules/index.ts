import { BasicExtrationRule } from './basic'
import { CJKExtrationRule } from './cjk'

export * from './base'
export * from './basic'
export * from './cjk'

export const defaultExtractionRules = [
  new BasicExtrationRule(),
  new CJKExtrationRule(),
]
