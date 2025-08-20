import TranslateEngine, { TranslateOptions } from './engines/base'
import GoogleTranslateEngine from './engines/google'
import GoogleTranslateCnEngine from './engines/google-cn'
import DeepLTranslateEngine from './engines/deepl'
import LibreTranslateEngine from './engines/libretranslate'
import BaiduTranslate from './engines/baidu'
import OpenAITranslateEngine from './engines/openai'
import LanguageWireTranslate from './engines/languagewire'

export class Translator {
  engines: Record<string, TranslateEngine> ={
    'google': new GoogleTranslateEngine(),
    'google-cn': new GoogleTranslateCnEngine(),
    'deepl': new DeepLTranslateEngine(),
    'libretranslate': new LibreTranslateEngine(),
    'baidu': new BaiduTranslate(),
    'openai': new OpenAITranslateEngine(),
    'languagewire': new LanguageWireTranslate(),
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
  LibreTranslateEngine,
  BaiduTranslate,
  OpenAITranslateEngine,
  LanguageWireTranslate,
}

export * from './engines/base'
