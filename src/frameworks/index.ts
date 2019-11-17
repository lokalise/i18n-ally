import { FrameworkDefinition } from './type'
import VueFrameworkDefinition from './vue-i18n'
import ReactFrameworkDefinition from './react-i18n'

export const frameworks = [
  VueFrameworkDefinition,
  ReactFrameworkDefinition,
]

export function getFramework (id: string): FrameworkDefinition | undefined {
  return frameworks.find(f => f.id === id)
}

export function getEnabledFrameworks ({ dependenciesNames }: {dependenciesNames: string[]}) {
  return frameworks.filter(f =>
    f.detection.packageJSON.some(key => dependenciesNames.includes(key)),
  )
}
