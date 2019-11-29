import { workspace } from 'vscode'
import YAML from 'js-yaml'
import i18n from '../i18n'
import { Log, File } from '../utils'
import { Framework, PackageFileType } from './base'
import VueFramework from './vue'
import ReactFramework from './react'
import I18nextFramework from './i18next'
import VSCodeFramework from './vscode'
import NgxTranslateFramework from './ngx-translate'
import I18nTagFramework from './i18n-tag'
import VueSFCFramework from './vue-sfc'
import FlutterFramework from './flutter'

export type PackageDependencies = Partial<Record<PackageFileType, string[]>>

export const frameworks: Framework[] = [
  new VueFramework(),
  new ReactFramework(),
  new NgxTranslateFramework(),
  new VSCodeFramework(),
  new FlutterFramework(),
  new I18nextFramework(),
  new I18nTagFramework(),
  new VueSFCFramework(),
]

export function getFramework (id: string): Framework | undefined {
  return frameworks.find(f => f.id === id)
}

export function getPackageDependencies (projectUrl: string): PackageDependencies {
  const result: PackageDependencies = {}

  if (!projectUrl || !workspace.workspaceFolders)
    return result

  try {
    const rawPackageJSON = File.readSync(`${projectUrl}/package.json`)
    const {
      dependencies = {},
      devDependencies = {},
      peerDependencies = {},
    } = JSON.parse(rawPackageJSON)

    result.packageJSON = [...Object.keys(dependencies), ...Object.keys(devDependencies), ...Object.keys(peerDependencies)]
  }
  catch (err) {
    Log.info('Error on parsing package.json')
  }

  try {
    const rawPubspecYAML = File.readSync(`${projectUrl}/pubspec.yaml`)
    const {
      dependencies = {},
      dev_dependencies = {},
    } = YAML.safeLoad(rawPubspecYAML)

    result.pubspecYAML = [...Object.keys(dependencies), ...Object.keys(dev_dependencies)]
  }
  catch (err) {
    Log.info('Error on parsing pubspec.yaml')
  }

  return result
}

export function getEnabledFrameworks (dependencies: PackageDependencies) {
  return frameworks.filter((f) => {
    for (const k of Object.keys(dependencies)) {
      const key = k as PackageFileType
      const packages = dependencies[key]
      const req = f.detection[key]

      if (packages && req) {
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
      }
    }

    return false
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
