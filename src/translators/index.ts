import TranslateEngine, { TranslateOptions } from './engines/base'
import GoogleTranslateEngine from './engines/google'
import GoogleTranslateCnEngine from './engines/google-cn'
import DeepLTranslateEngine from './engines/deepl'
import BaiduTranslateEngine from './engines/baidu'
import LibreTranslateEngine from './engines/libretranslate'

export class Translator {
  engines: Record<string, TranslateEngine> ={
    'google': new GoogleTranslateEngine(),
    'google-cn': new GoogleTranslateCnEngine(),
    'deepl': new DeepLTranslateEngine(),
    'baidu': new BaiduTranslateEngine(),
    'libretranslate': new LibreTranslateEngine(),
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
  BaiduTranslateEngine,
  LibreTranslateEngine,
}

export * from './engines/base'
