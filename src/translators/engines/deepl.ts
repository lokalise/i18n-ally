import axios from 'axios'
import qs from 'qs'

import { Log } from '../../utils'
import { Config } from '../../core'
import TranslateEngine, { TranslateOptions, TranslateResult } from './base'

interface DeepLUsage {
  character_count: number
  character_limit: number
}

interface DeepLTranslate {
  detected_source_language: string
  text: string
}

interface DeepLTranslateRes {
  translations: DeepLTranslate[]
}

const deepl = axios.create({
  baseURL: 'https://api.deepl.com/v2',
})

deepl.interceptors.request.use((value) => {
  value.params = {
    auth_key: Config.deeplApiKey,
  }

  if (value.method === 'POST' || value.method === 'post') {
    value.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    value.data = qs.stringify(value.data)
  }

  return value
})

async function usage(): Promise<DeepLUsage> {
  try {
    return await deepl.get('/usage', {
      params: {
        auth_key: Config.deeplApiKey,
      },
    }).then(({ data }) => data)
  }
  catch (err) {
    console.trace(err)
    console.log(err)

    throw err
  }
}

class DeepL extends TranslateEngine {
  async translate(options: TranslateOptions) {
    try {
      const res: DeepLTranslateRes = await deepl({
        method: 'POST',
        url: '/translate',
        data: {
          text: options.text,
          source_lang: options.from || undefined,
          target_lang: options.to,
        },
      }).then(({ data }) => data)

      return this.transform(res.translations, options)
    }
    catch (err) {
      console.log(err)

      throw err
    }
  }

  transform(res: DeepLTranslate[], options: TranslateOptions): TranslateResult {
    const r: TranslateResult = {
      text: options.text,
      to: options.to || 'auto',
      from: options.from || 'auto',
      response: res,
      linkToResult: '',
    }

    try {
      const result: string[] = []

      res.forEach((tran: DeepLTranslate) => result.push(tran.text))

      r.result = result
    }
    catch (err) {}

    if (!r.detailed && !r.result) r.error = new Error('No result')

    this.log(`DEEPL TRANSLATE!! ${JSON.stringify(r.result)}, from ${options.from} to ${options.to}`)

    return r
  }

  log(...args: any[]) {
    if (Config.deeplLog) Log.raw(args)
  }
}

export default DeepL

export {
  usage,
}
