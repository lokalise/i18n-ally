import axios from 'axios'
import TranslateEngine, { TranslateOptions, TranslateResult } from './base'
import crypto from 'crypto';
import { Config } from '~/core'

interface BaiduSignOptions {
  appid: string | null | undefined
  salt: string
  secret: string | null | undefined
  query: string
}

export default class BaiduTranslate extends TranslateEngine {
  apiRoot = 'https://fanyi.baidu.com'

  async translate(options: TranslateOptions) {
    let {
      from = 'auto',
      to = 'auto',
    } = options

    const appid = Config.baiduAppid
    const secret = Config.baiduApiSecret
    const salt = Date.now().toString()
    const sign = this.getSign({ appid, secret, query: options.text, salt });

    const form = {
      appid,
      salt,
      q: options.text,
      from,
      to,
      sign
    }

    const { data } = await axios({
      method: 'POST',
      url: `${this.apiRoot}/api/trans/vip/translate`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: form
    })

    return this.transform(data, options)
  }

  getSign({appid, salt, query, secret} : BaiduSignOptions): string {
    if (appid && salt) {
      let string = appid + query + salt + secret;
      const md5 = crypto.createHash('md5');
      md5.update(string);
      return md5.digest('hex');
    }
    return '';
  }

  transform(response: any, options: TranslateOptions): TranslateResult {
    const {
      text,
      from = 'auto',
      to = 'auto',
    } = options

    const r: TranslateResult = {
      text,
      to,
      from: response.src,
      response,
      linkToResult: `${this.apiRoot}/#${from}/${to}/${text}`,
    }

    try {
      const result: string[] = []
      response.data.trans_result.forEach((v: any) => {
        result.push(v.dst)
      })
      r.result = result
    }
    catch (e) {}

    if (!r.result)
      r.error = new Error('No result')

    return r
  }
}
