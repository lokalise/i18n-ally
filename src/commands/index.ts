import { flatten } from 'lodash'
import { ExtensionModule } from '../modules'
import serverCommands from '../server/command'
import configLocales from './configLocalePaths'
import configLanguages from './configLanguages'
import keyManipulations from './keyManipulations'
import extractText from './extractText'
import help from './help'
import refreshUsageReport from './refreshUsageReport'
import editor from './openEditor'
import review from './review'

const m: ExtensionModule = (ctx) => {
  return flatten([
    configLocales(ctx),
    configLanguages(ctx),
    keyManipulations(ctx),
    extractText(ctx),
    help(ctx),
    refreshUsageReport(ctx),
    editor(ctx),
    review(ctx),
    serverCommands(ctx),
  ])
}

export default m
