import { flatten } from 'lodash'
import { ExtensionModule } from '../modules'
import LocalesTreeView from './LocalesTreeView'
import ProgressView from './ProgressView'
import FileLocalesTreeView from './FileLocalesTreeView'
import HelpFeedbackTreeView from './HelpFeedbackView'

const m: ExtensionModule = (ctx) => {
  return flatten([
    LocalesTreeView(ctx),
    ProgressView(ctx),
    FileLocalesTreeView(ctx),
    HelpFeedbackTreeView(ctx),
  ])
}

export default m
