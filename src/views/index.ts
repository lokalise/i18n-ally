import { flatten } from 'lodash'
import { ExtensionModule } from '../modules'
import LocalesTreeView from './LocalesTreeView'
import ProgressView from './ProgressView'
import FileLocalesTreeView from './FileLocalesTreeView'

const m: ExtensionModule = (ctx) => {
  return flatten([
    LocalesTreeView(ctx),
    ProgressView(ctx),
    FileLocalesTreeView(ctx),
  ])
}

export default m
