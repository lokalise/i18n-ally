import TranslateEngine, { TranslateOptions } from './engines/base'
import GoogleTranslateEngine from './engines/google'
import GoogleTranslateCnEngine from './engines/google-cn'
import DeepLTranslateEngine from './engines/deepl'

export class Translator {
  engines: Record<string, TranslateEngine> ={
    google: new GoogleTranslateEngine(),
    'google-cn': new GoogleTranslateCnEngine(),
    deepl: new DeepLTranslateEngine(),
  }

  async translate(options: TranslateOptions & { engine: string }) {
    const engine = this.engines[options.engine]
    return await engine.translate(options)
  }
}

export {
  TranslateEngine,
  GoogleTranslateEngine,
  GoogleTranslateCnEngine,
  DeepLTranslateEngine,
}

export * from './engines/base'
