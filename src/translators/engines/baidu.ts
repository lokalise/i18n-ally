import axios from 'axios'
import qs from 'qs'
import md5 from 'js-md5'
import TranslateEngine, { TranslateOptions, TranslateResult } from './base'
import { Log } from '~/utils'
import { Config } from '~/core'

interface BaiduTranslate {
  src: string
  dst: string
}

interface BaiduTranslateRes {
  trans_result: BaiduTranslate[]
  error_code?: string
  error_msg?: string
}

const baidu = axios.create({})

baidu.interceptors.request.use((req) => {
  req.baseURL = 'https://fanyi-api.baidu.com/api/trans/vip'

  if (req.method === 'POST' || req.method === 'post') {
    req.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    req.data = qs.stringify(req.data)
  }

  log(true, req)

  return req
})

baidu.interceptors.response.use((res) => {
  const data = res.data as BaiduTranslateRes

  if (data.error_code)
    return Promise.reject(new Error(`${data.error_msg}, error code: ${data.error_code}`))

  log(true, res)

  return res
})

function log(inspector: boolean, ...args: any[]): void {
  if (Config.baiduLog) {
    // eslint-disable-next-line no-console
    if (inspector) console.log('[baidu]\n', ...args)
    else Log.raw(...args)
  }
}

function stripeLocaleCode(locale?: string): string | undefined {
  if (!locale) return locale
  const index = locale.indexOf('-')
  if (index === -1) return locale
  return locale.slice(0, index)
}

export default class Baidu extends TranslateEngine {
  async translate(options: TranslateOptions) {
    const appId = Config.baiduAppId
    const secretKey = Config.baiduSecretKey
    if (!appId || !secretKey)
      throw new Error('AppId or SecretKey is invalid!')

    const salt = Date.now()
    const sign = md5(`${appId}${options.text}${salt}${secretKey}`)

    try {
      const res: BaiduTranslateRes = await baidu({
        method: 'POST',
        url: '/translate',
        data: {
          q: options.text,
          from: stripeLocaleCode(options.from || 'auto'),
          to: stripeLocaleCode(options.to),
          appid: appId,
          salt,
          sign,
        },
      }).then(({ data }) => data)

      return this.transform(res.trans_result, options)
    }
    catch (err) {
      log(false, err)

      throw err
    }
  }

  transform(res: BaiduTranslate[], options: TranslateOptions): TranslateResult {
    const { text, from = 'auto', to = 'auto' } = options

    const r: TranslateResult = {
      text,
      to,
      from,
      response: res,
      linkToResult: '',
    }

    try {
      const result: string[] = []

      res.forEach(tran => result.push(tran.dst))

      r.result = result
    }
    catch (err) {}

    if (!r.detailed && !r.result) r.error = new Error('No result')

    log(
      false,
      `BAIDU TRANSLATE!! ${JSON.stringify(r.result)}, from ${options.from} to ${
        options.to
      }`,
    )

    return r
  }
}
