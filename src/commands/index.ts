import { flatten } from 'lodash'
import { ExtensionModule } from '../modules'
import configLocales from './configLocales'
import configLanguages from './configLanguages'
import keyManipulations from './keyManipulations'
import extractText from './extractText'
import help from './help'
import dev from './dev'

const m: ExtensionModule = (ctx) => {
  return flatten([
    configLocales(ctx),
    configLanguages(ctx),
    keyManipulations(ctx),
    extractText(ctx),
    help(ctx),
    dev(ctx),
  ])
}

export default m
