import TranslateEngine, { TranslateOptions } from './engines/base'
import GoogleTranslate from './engines/google'
import GoogleTranslateCN from './engines/google-cn'
import DeepLTranslate from './engines/deepl'

export default class Transaltor {
  engines: Record<string, TranslateEngine> ={
    google: new GoogleTranslate(),
    'google-cn': new GoogleTranslateCN(),
    deepl: new DeepLTranslate(),
  }

  async translate(options: TranslateOptions & { engine: string }) {
    const engine = this.engines[options.engine]
    return await engine.translate(options)
  }
}
