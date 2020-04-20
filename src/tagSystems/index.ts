import { TagSystemNone } from './none'
import { BCP47 } from './bcp47'
import { BaseTagSystem } from './base'
import { ECMA402 } from './ecma402'

export const TagSystems: Record<string, BaseTagSystem> = {
  none: new TagSystemNone(),
  bcp47: new BCP47(),
  ecma402: new ECMA402(),
}
