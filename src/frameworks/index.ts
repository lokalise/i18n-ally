import { FrameworkDefinition } from './type'
import VueFrameworkDefinition from './vue'
import ReactFrameworkDefinition from './react'
import i18nextFrameworkDefinition from './i18next'

export const frameworks = [
  VueFrameworkDefinition,
  ReactFrameworkDefinition,
  i18nextFrameworkDefinition,
]

export function getFramework (id: string): FrameworkDefinition | undefined {
  return frameworks.find(f => f.id === id)
}

export function getEnabledFrameworks ({ packages }: { packages: string[] }) {
  return frameworks.filter((f) => {
    if (typeof f.detection.packageJSON === 'function')
      return f.detection.packageJSON(packages)
    else
      return f.detection.packageJSON.some(key => packages.includes(key))
  })
}
