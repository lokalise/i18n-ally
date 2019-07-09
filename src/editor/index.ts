import { flatten } from 'lodash'
import { ExtensionModule } from '../modules'
import annotation from './annotation'
import completion from './completion'
import extract from './extract'
import hint from './hint'
import definition from './definition'
import refactor from './refactor'
import problems from './problems'
import reference from './reference'

const m: ExtensionModule = (ctx) => {
  return flatten([
    annotation(ctx),
    completion(ctx),
    extract(ctx),
    hint(ctx),
    refactor(ctx),
    definition(ctx),
    problems(ctx),
    reference(ctx),
  ])
}

export default m
