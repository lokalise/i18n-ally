import VueFrameworkDefinition from './vue'
import { FrameworkDefinition } from './type'

export const frameworks = [
  VueFrameworkDefinition,
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
