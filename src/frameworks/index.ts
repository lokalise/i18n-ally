import VueI18nFrameworkDefinition from './vue-i18n'
import { FrameworkDefinition } from './type'

export const frameworks = [
  VueI18nFrameworkDefinition,
]

export function getFramework (id: string): FrameworkDefinition | undefined {
  return frameworks.find(f => f.id === id)
}

export function getEnabledFrameworks ({ dependenciesNames }: {dependenciesNames: string[]}) {
  return frameworks.filter((f) => {
    for (const key of f.detection.packageJSON) {
      if (dependenciesNames.includes(key))
        return true
    }
    return false
  })
}

export function getEnabledFrameworksByIds (ids: string[]) {
  return frameworks.filter(f => ids.includes(f.id))
}
