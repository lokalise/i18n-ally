import axios from 'axios'
import TranslateEngine, { TranslateOptions, TranslateResult } from './base'
import { Config } from '~/core'

export default class LanguageWireTranslate extends TranslateEngine {
  apiRoot = 'https://lwt.languagewire.com/p/api/v1'

  async translate(options: TranslateOptions) {
    const apiKey = Config.languageWireApiKey
    let apiRoot = this.apiRoot
    if (Config.languageWireApiRoot) apiRoot = Config.languageWireApiRoot.replace(/\/$/, '')

    if (!apiKey) throw new Error('LanguageWire: missing API key. Configure i18n-ally.translate.languagewire.apiKey in settings.')
    if (!options.to) throw new Error('LanguageWire: target language "to" is required.')

    const response = await axios.post(
      `${apiRoot}/translations/text`,
      {
        sourceText: options.text,
        reference: {
          source: 'USER',
        },
        targetLanguage: options.to,
        // If source language is specified, include it
        ...(options.from !== 'auto' && { sourceLanguage: options.from }),
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        timeout: 15000,
      },
    )

    return this.transform(response, options)
  }

  transform(response: any, options: TranslateOptions): TranslateResult {
    const { text, from = 'auto', to = 'auto' } = options

    // Get the translated text from the response
    const raw = response?.data?.translation
    const translatedText = typeof raw === 'string' ? raw.trim() : undefined

    // Determine the detected source language
    const detectedSource = response?.data?.detectedSourceLanguage?.mmtCode || from

    const r: TranslateResult = {
      text,
      to,
      from: detectedSource,
      response,
      result: translatedText ? [translatedText] : undefined,
      linkToResult: '',
    }

    return r
  }
}
