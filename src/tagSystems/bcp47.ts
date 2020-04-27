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

    return bcp47.stringify(bcp47.parse(locale, { normalize: strict, forgiving: !strict })) || fallback
  }

  toBCP47(locale: string) {
    return bcp47.stringify(bcp47.parse(locale, { normalize: true, forgiving: false })) || undefined
  }

  toFlagname(locale: string) {
    const { region, language } = bcp47.parse(locale, { normalize: true, forgiving: true })
    const flag = (region || language || '').toLowerCase()
    return this.flagMapping[flag] || flag
  }

  lookup(locale: string) {
    locale = this.normalize(locale)
    // @ts-ignore
    const canonical = Intl.getCanonicalLocales(locale)[0]
    return Intl.Collator.supportedLocalesOf(canonical, { localeMatcher: 'lookup' })[0]
  }
}
