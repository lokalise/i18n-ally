import { flatten } from 'lodash'
import { ExtensionModule } from '../modules'
import configLocales from './configLocales'
import configLanguages from './configLanguages'
import keyManipulations from './keyManipulations'
import extractText from './extractText'
import help from './help'
import refreshUsageReport from './refreshUsageReport'
import editor from './editor'

const m: ExtensionModule = (ctx) => {
  return flatten([
    configLocales(ctx),
    configLanguages(ctx),
    keyManipulations(ctx),
    extractText(ctx),
    help(ctx),
    refreshUsageReport(ctx),
    editor(ctx),
  ])
}

export default m
