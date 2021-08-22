import { BaseTagSystem } from './base'

// https://tc39.es/ecma402/#sec-intl.getcanonicallocales
// LegacyTagSystem used before v2.x
export class LegacyTagSystem extends BaseTagSystem {
  normalize(locale?: string, fallback = 'en', strict = false) {
    if (!locale)
      return fallback

    try {
      locale = locale.replace(/_/g, '-')
      if (locale.split('-')[0].length !== 2)
        return fallback
      // @ts-ignore
      const canonical = Intl.getCanonicalLocales(locale)[0]
      if (strict)
        return Intl.Collator.supportedLocalesOf(canonical, { localeMatcher: 'lookup' })[0]
      return canonical
    }
    catch (e) {
      return fallback
    }
  }

  toFlagname(locale: string) {
    return locale.includes('-')
      ? locale.toLocaleLowerCase().split('-', 2).slice(-1)[0]?.toLowerCase()
      : locale.toLowerCase()
  }
}
