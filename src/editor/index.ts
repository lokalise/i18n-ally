import { flatten } from 'lodash'
import { ExtensionModule } from '../modules'
import annotation from './annotation'
import completion from './completion'
import extract from './extract'
import hint from './hint'
import definition from './definition'

const m: ExtensionModule = (ctx) => {
  return flatten([
    annotation(ctx),
    completion(ctx),
    extract(ctx),
    hint(ctx),
    definition(ctx),
  ])
}

export default m
