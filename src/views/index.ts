import { ExtensionModule } from '../modules'
import LocalesTreeView from './LocalesTreeView'
import ProgressView from './ProgressView'

const m: ExtensionModule = (ctx) => {
  LocalesTreeView(ctx)
  ProgressView(ctx)
}

export default m
