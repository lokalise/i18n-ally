import { flatten } from 'lodash'
import { ExtensionModule } from '../modules'
import configLocalesAuto from './configLocalesAuto'
import configDisplayLanguage from './configDisplayLanguage'
import configLocalesGuide from './configLocalesGuide'
import keyManipulations from './keyManipulations'
import extractText from './extractText'

export * from '../core/Commands'

const m: ExtensionModule = (ctx) => {
  return flatten([
    configLocalesAuto(ctx),
    configDisplayLanguage(ctx),
    configLocalesGuide(ctx),
    keyManipulations(ctx),
    extractText(ctx),
  ])
}

export default m
