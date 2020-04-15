import axios from 'axios'
import TranslateEngine, { TranslateOptions, TranslateResult } from './base'

export default class GoogleTranslate extends TranslateEngine {
  link = 'https://translate.google.com'
  apiRoot = 'https://translate.googleapis.com'

  async translate(options: TranslateOptions) {
    const { data } = await axios({
      method: 'GET',
      url: `${this.apiRoot}/translate_a/single?client=gtx&sl=${options.from || 'auto'}&tl=${options.to || 'auto'}&hl=zh-CN&dt=t&dt=bd&ie=UTF-8&oe=UTF-8&dj=1&source=icon&q=${encodeURI(options.text)}`,
    })

    return this.transform(data, options)
  }

  transform(rawRes: any, options: TranslateOptions): TranslateResult {
    const r: TranslateResult = {
      text: options.text,
      to: options.to || 'auto',
      from: rawRes.src,
      response: rawRes,
      linkToResult: `${this.link}/#auto/${options.to || 'auto'}/${options.text}`,
    }

    // 尝试获取详细释义
    try {
      const d: string[] = []
      rawRes.dict.forEach((v: any) => {
        d.push(`${v.pos}：${(v.terms.slice(0, 3) || []).join(',')}`)
      })
      r.detailed = d
    }
    catch (e) {}

    // 尝试取得翻译结果
    try {
      const result: string[] = []
      rawRes.sentences.forEach((v: any) => {
        result.push(v.trans)
      })
      r.result = result
    }
    catch (e) {}

    if (!r.detailed && !r.result)
      r.error = new Error('No result')

    return r
  }
}
