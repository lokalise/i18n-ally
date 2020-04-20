// @ts-ignore
import normalize from 'bcp-47-normalize'
// @ts-ignore
import bcp47 from 'bcp-47'
import { BaseTagSystem } from './base'

// https://tools.ietf.org/html/bcp47
export class BCP47 extends BaseTagSystem {
  normalize(locale?: string, fallback = 'en', strict = false) {
    if (!locale)
      return fallback

    return normalize(locale, { forgiving: !strict }) || fallback
  }

  getFlagName(locale: string) {
    const { region, language } = bcp47.parse(locale)
    return (region || language || '').toLowerCase()
  }
}
