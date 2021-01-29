import { flatten } from 'lodash'
import annotation from './annotation'
import completion from './completion'
import extract from './extract'
import definition from './definition'
import refactor from './refactor'
import problems from './problems'
import reference from './reference'
import statusbar from './statusbar'
import reviewComments from './reviewComments'
import { ExtensionModule } from '~/modules'

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
    reviewComments(ctx),
  ])
}

export default m
