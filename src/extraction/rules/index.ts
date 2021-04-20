import { BasicExtrationRule } from './basic'
import { CJKExtrationRule } from './cjk'
import { DynamicExtractionRule } from './dynamic'

export * from './base'
export * from './basic'
export * from './cjk'

export const DefaultExtractionRules = [
  new BasicExtrationRule(),
  new CJKExtrationRule(),
]

export const DefaultDynamicExtractionsRules = [
  new DynamicExtractionRule(),
]
