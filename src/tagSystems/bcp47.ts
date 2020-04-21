// @ts-ignore
import bcp47 from 'bcp-47'
import { BaseTagSystem } from './base'

// https://tools.ietf.org/html/bcp47
export class BCP47 extends BaseTagSystem {
  // this maps language code to its default region
  flagMapping: Record<string, string> = {
    en: 'us',
    zh: 'cn',
    cs: 'cz',
    da: 'dk',
    el: 'gr',
  }

  normalize(locale?: string, fallback = 'en', strict = false) {
    if (!locale)
      return fallback

    return bcp47.stringify(bcp47.parse(locale, { normalize: true, forgiving: !strict })) || fallback
  }

  toFlagname(locale: string) {
    const { region, language } = bcp47.parse(locale)
    const flag = (region || language || '').toLowerCase()
    return this.flagMapping[flag] || flag
  }
}
