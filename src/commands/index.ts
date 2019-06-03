import { ExtensionModule } from '../modules'
import configLocalesAuto from './configLocalesAuto'
import configDisplayLanguage from './configDisplayLanguage'
import configLocalesGuide from './configLocalesGuide'
import debug from './debug'

export * from './Command'

const m: ExtensionModule = (ctx) => {
  configLocalesAuto(ctx)
  configDisplayLanguage(ctx)
  configLocalesGuide(ctx)
  debug(ctx)
}

export default m
