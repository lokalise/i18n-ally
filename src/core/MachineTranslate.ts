import { google, baidu, youdao } from 'translation.js'
import { TranslateResult } from 'translation.js/declaration/api/types'

export async function MachinTranslate (text: string, from: string, to: string) {
  const plans = [google, baidu, youdao]
  let trans_result: TranslateResult | undefined

  const errors: Error[] = []

  for (const plan of plans) {
    try {
      trans_result = await plan.translate({ text, from, to, com: true })
      break
    }
    catch (e) {
      errors.push(e)
    }
  }

  const result = trans_result && (trans_result.result || []).join('\n')

  if (!result)
    throw errors

  return result
}
