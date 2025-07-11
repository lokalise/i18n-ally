import * as bcp47 from 'bcp-47'
import { BaseTagSystem } from './base'
import { Config } from '~/core'

// https://tools.ietf.org/html/bcp47
export class BCP47 extends BaseTagSystem {
  normalize(locale?: string, fallback = 'en', strict = false) {
    if (!locale)
      return fallback

    // First, parse with bcp47
    const parsed = bcp47.parse(locale, { normalize: strict, forgiving: !strict })
    // If the parsed result has a region, or language+region can restore the original locale, use stringify
    if (parsed && parsed.language) {
      if (parsed.region)
        return bcp47.stringify(parsed)
        // Compatible with underscore formats like zh_CN, zh_TW, en_US
      if (locale.match(/^[a-z]{2,3}[_-][A-Z]{2,4}$/)) {
        // Convert to standard BCP47 format zh-CN
        return locale.replace('_', '-')
      }
      // Compatible with cases where only the main language is present
      return parsed.language
    }
    // If parsing fails, return the original locale directly
    return locale || fallback
  }

  toBCP47(locale: string) {
    return bcp47.stringify(bcp47.parse(locale, { normalize: true, forgiving: false })) || undefined
  }

  toFlagname(locale: string) {
    const { region, language } = bcp47.parse(locale, { normalize: true, forgiving: true })
    if (!language)
      return ''
    return (region || Config.localeCountryMap[language] || language || '').toLowerCase()
  }

  lookup(locale: string) {
    locale = this.normalize(locale)
    // @ts-ignore
    const canonical = Intl.getCanonicalLocales(locale)[0]
    return Intl.Collator.supportedLocalesOf(canonical, { localeMatcher: 'lookup' })[0]
  }
}
