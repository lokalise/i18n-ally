import { TagSystemNone } from './none'
import { BCP47 } from './bcp47'
import { BaseTagSystem } from './base'
import { LegacyTagSystem } from './legacy'

export const TagSystems: Record<string, BaseTagSystem> = {
  none: new TagSystemNone(),
  bcp47: new BCP47(),
  legacy: new LegacyTagSystem(),
}
