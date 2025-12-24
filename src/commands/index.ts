import { flatten } from 'lodash'
import configLocales from './configLocalePaths'
import configLanguages from './configLanguages'
import keyManipulations from './keyManipulations'
import extractText from './extractString'
import detectHardStrings from './detectHardStrings'
import help from './help'
import refreshUsageReport from './refreshUsageReport'
import editor from './openEditor'
import review from './review'
import deepl from './deepl'
import gotoRange from './gotoRange'
import gotoNextUsage from './gotoNextUsage'
import batchHardStringsExtract from './extractStringBulk'
import exportUsageReport from './exportUsageReport'
import { ExtensionModule } from '~/modules'

const m: ExtensionModule = (ctx) => {
  return flatten([
    configLocales(ctx),
    configLanguages(ctx),
    keyManipulations(ctx),
    extractText(ctx),
    detectHardStrings(ctx),
    batchHardStringsExtract(ctx),
    help(ctx),
    refreshUsageReport(ctx),
    exportUsageReport(ctx),
    editor(ctx),
    review(ctx),
    deepl(ctx),
    gotoRange(ctx),
    gotoNextUsage(ctx),
  ])
}

export * from './commands'

export default m
