import axios from 'axios'
import TranslateEngine, { TranslateOptions, TranslateResult } from './base'
import { Config } from '~/core'

export default class GoogleTranslate extends TranslateEngine {
  link = 'https://translate.google.com'
  apiRoot = 'https://translate.googleapis.com'
  apiRootIfUserSuppliedKey = 'https://translation.googleapis.com'

  async translate(options: TranslateOptions) {
    let {
      from = 'auto',
      to = 'auto',
    } = options

    const key = Config.googleApiKey

    if (key) {
      from = this.convertToSupportedLocalesForGoogleCloud(from)
      to = this.convertToSupportedLocalesForGoogleCloud(to)
    }

    const slugs = {
      from: from === 'auto' || !from ? '' : `&source=${from}`,
      to: to === 'auto' || !to ? '' : `&target=${to}`,
    }

    const { data } = await axios({
      method: 'GET',
      url: key
        ? `${this.apiRootIfUserSuppliedKey}/language/translate/v2?key=${key}&q=${encodeURI(options.text)}${slugs.from}${slugs.to}&alt=json&format=text`
        : `${this.apiRoot}/translate_a/single?client=gtx&sl=${from}&tl=${to}&hl=zh-CN&dt=t&dt=bd&ie=UTF-8&oe=UTF-8&dj=1&source=icon&q=${encodeURI(options.text)}`,
    })

    return this.transform(data, options, !!key)
  }

  /**
   * @see https://sites.google.com/site/tomihasa/google-language-codes
   * @todo find a translate-specific source?
   * af, ach, ak, am, ar, az, be, bem, bg, bh, bn, br, bs, ca, chr, ckb,
   * co, crs, cs, cy, da, de, ee, el, en, eo, es, es-419, et, eu, fa, fi,
   * fo, fr, fy, ga, gaa, gd, gl, gn, gu, ha, haw, hi, hr, ht, hu, hy, ia,
   * id, ig, is, it, iw, ja, jw, ka, kg, kk, km, kn, ko, kri, ku, ky, la,
   * lg, ln, lo, loz, lt, lua, lv, mfe, mg, mi, mk, ml, mn, mo, mr, ms, mt,
   * ne, nl, nn, no, nso, ny, nyn, oc, om, or, pa, pcm, pl, ps, pt-BR,
   * pt-PT, qu, rm, rn, ro, ru, rw, sd, sh, si, sk, sl, sn, so, sq, sr,
   * sr-ME, st, su, sv, sw, ta, te, tg, th, ti, tk, tl, tn, to, tr, tt,
   * tum, tw, ug, uk, ur, uz, vi, wo, xh, xx-bork, xx-elmer, xx-hacker,
   * xx-klingon, xx-pirate, yi, yo, zh-CN, zh-TW, zu
   */
  convertToSupportedLocalesForGoogleCloud(locale: string): string {
    const longSupportedLocales = ['ach', 'bem', 'ckb', 'es-419', 'gaa', 'haw',
      'kri', 'loz', 'lua', 'mfe', 'nso', 'nyn', 'hmn', 'auto', 'zh-CN', 'sr-ME',
      'zh-TW', 'pcm', 'pt-BR', 'pt-PT', 'tum', 'xx-bork', 'xx-elmer', 'xx-hacker',
      'xx-klingon', 'xx-pirate']
    if (locale && longSupportedLocales.includes(locale))
      locale = locale.substring(0, 2)

    return locale
  }

  transform(response: any, options: TranslateOptions, apiKeySuppliedByUser: boolean): TranslateResult {
    const {
      text,
      to = 'auto',
    } = options

    const r: TranslateResult = {
      text,
      to,
      from: response.src,
      response,
      linkToResult: `${this.link}/#auto/${to}/${text}`,
    }

    if (apiKeySuppliedByUser) {
      try {
        const result: string[] = []
        response.data.translations.forEach((v: any) => {
          result.push(v.translatedText)
        })
        r.result = result
      }
      catch (e) {}
    }

    else {
      // 尝试获取详细释义
      try {
        const detailed: string[] = []
        response.dict.forEach((v: any) => {
          detailed.push(`${v.pos}：${(v.terms.slice(0, 3) || []).join(',')}`)
        })
        r.detailed = detailed
      }
      catch (e) {}

      // 尝试取得翻译结果
      try {
        const result: string[] = []
        response.sentences.forEach((v: any) => {
          result.push(v.trans)
        })
        r.result = result
      }
      catch (e) {}
    }

    if (!r.detailed && !r.result)
      r.error = new Error('No result')

    return r
  }
}
