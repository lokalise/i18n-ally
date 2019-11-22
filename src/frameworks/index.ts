import i18n from '../i18n'
import { Log } from '../utils'
import { Framework } from './base'
import VueFramework from './vue'
import ReactFramework from './react'
import I18nextFramework from './i18next'
import VSCodeFramework from './vscode'
import NgxTranslateFramework from './ngx-translate'
import I18nTagFramework from './i18n-tag'

export const frameworks: Framework[] = [
  new VueFramework(),
  new ReactFramework(),
  new NgxTranslateFramework(),
  new VSCodeFramework(),
  new I18nextFramework(),
  new I18nTagFramework(),
]

export function getFramework (id: string): Framework | undefined {
  return frameworks.find(f => f.id === id)
}

export function getEnabledFrameworks ({ packages }: { packages: string[] }) {
  return frameworks.filter((f) => {
    const req = f.detection.packageJSON
    if (typeof req === 'function') {
      return req(packages)
    }
    else if (Array.isArray(req)) {
      return req.some(key => packages.includes(key))
    }
    else {
      const none = req.none ? !req.none.some(key => packages.includes(key)) : true
      const any = req.any ? req.any.some(key => packages.includes(key)) : true
      const every = req.every ? req.every.every(key => packages.includes(key)) : true

      return none && any && every
    }
  })
}

export function getEnabledFrameworksByIds (ids: string[]) {
  const missedFrameworks: string[] = []
  const enabledFrameworks = ids.flatMap((id) => {
    const framework = frameworks.find(f => f.id === id)
    if (!framework) {
      missedFrameworks.push(id)
      return []
    }
    return [framework]
  })

  if (missedFrameworks.length > 0)
    Log.warning(i18n.t('prompt.frameworks_not_found', missedFrameworks.join(', ')), true)

  return enabledFrameworks
}
