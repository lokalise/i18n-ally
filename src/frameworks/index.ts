import { FrameworkDefinition } from './type'
import VueI18nFrameworkDefinition from './vue-i18n'
import ReactI18nFrameworkDefinition from './react-i18n'

export const frameworks = [
  VueI18nFrameworkDefinition,
  ReactI18nFrameworkDefinition,
]

export function getFramework (id: string): FrameworkDefinition | undefined {
  return frameworks.find(f => f.id === id)
}

export function getEnabledFrameworks ({ dependenciesNames }: {dependenciesNames: string[]}) {
  return frameworks.filter(f =>
    f.detection.packageJSON.some(key => dependenciesNames.includes(key)),
  )
}
