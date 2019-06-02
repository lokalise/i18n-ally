import { google, baidu, youdao } from 'translation.js'
import { TranslateResult } from 'translation.js/declaration/api/types'

export async function MachinTranslate (text: string, from: string, to: string) {
  const plans = [google, baidu, youdao]
  let result: TranslateResult | undefined

  for (const plan of plans) {
    try {
      result = await plan.translate({ text, from, to, com: true })
      break
    }
    catch (e) {
      console.error(e)
    }
  }

  return result && result.text
}
