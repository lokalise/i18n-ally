import { flatten } from 'lodash'
import { ExtensionModule } from '../modules'
import annotation from './annotation'
import localeAnnotation from './localeAnnotation'
import completion from './completion'
import extract from './extract'
import definition from './definition'
import refactor from './refactor'
import problems from './problems'
import reference from './reference'
import statusbar from './statusbar'

const m: ExtensionModule = (ctx) => {
  return flatten([
    annotation(ctx),
    completion(ctx),
    extract(ctx),
    refactor(ctx),
    definition(ctx),
    problems(ctx),
    reference(ctx),
    statusbar(ctx),
    localeAnnotation(ctx),
  ])
}

export default m
