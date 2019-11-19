import { Framework } from './base'
import VueFramework from './vue'
import ReactFramework from './react'
import I18nextFramework from './i18next'
import VSCodeFramework from './vscode'
import NgxTranslateFramework from './ngx-translate'

export const frameworks = [
  new VueFramework(),
  new ReactFramework(),
  new NgxTranslateFramework(),
  new VSCodeFramework(),
  new I18nextFramework(),
]

export function getFramework (id: string): Framework | undefined {
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

export function getEnabledFrameworksByIds (ids: string[]) {
  return frameworks.filter(f => ids.includes(f.id))
}
