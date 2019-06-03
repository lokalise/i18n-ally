import { ExtensionModule } from '../modules'
import autoDetectLocales from './autoDetectLocales'
import configDisplayLanguage from './configDisplayLanguage'
import configLocalesGuide from './configLocalesGuide'
import debug from './debug'

const m: ExtensionModule = (ctx) => {
  autoDetectLocales(ctx)
  configDisplayLanguage(ctx)
  configLocalesGuide(ctx)
  debug(ctx)
}

export default m
