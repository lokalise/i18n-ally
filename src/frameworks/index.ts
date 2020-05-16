import { workspace } from 'vscode'
import i18n from '../i18n'
import { Log } from '../utils'
import { PackageJSONParser, PubspecYAMLParser, ComposerJSONParser, GemfileParser } from '../packagesParsers'
import { Framework, PackageFileType } from './base'
import VueFramework from './vue'
import ReactFramework from './react'
import I18nextFramework from './i18next'
import VSCodeFramework from './vscode'
import NgxTranslateFramework from './ngx-translate'
import I18nTagFramework from './i18n-tag'
import VueSFCFramework from './vue-sfc'
import FlutterFramework from './flutter'
import EmberFramework from './ember'
import CustomFramework from './custom'
import PhpJoomlaFramework from './php-joomla'
import ChromeExtensionFramework from './chrome-ext'
import RubyRailsFramework from './ruby-rails'
import LaravelFramework from './laravel'
import TranslocoFramework from './transloco'
import SvelteFramework from './svelte'
import PolyglotFramework from './polyglot'
import GlobalizeFramework from './globalize'
import UI5Framework from './ui5'
import NextTranslateFramework from './next-translate'

export type PackageDependencies = Partial<Record<PackageFileType, string[]>>

export const frameworks: Framework[] = [
  // Custom should be the first one
  new CustomFramework(),

  new VueFramework(),
  new ReactFramework(),
  new NgxTranslateFramework(),
  new VSCodeFramework(),
  new FlutterFramework(),
  new EmberFramework(),
  new I18nextFramework(),
  new I18nTagFramework(),
  new PhpJoomlaFramework(),
  new LaravelFramework(),
  new ChromeExtensionFramework(),
  new RubyRailsFramework(),
  new TranslocoFramework(),
  new SvelteFramework(),
  new PolyglotFramework(),
  new GlobalizeFramework(),
  new UI5Framework(),
  new NextTranslateFramework(),

  // Vue SFC should be the last one
  new VueSFCFramework(),
]

export function getFramework(id: string): Framework | undefined {
  return frameworks.find(f => f.id === id)
}

export function getPackageDependencies(projectUrl: string): PackageDependencies {
  const result: PackageDependencies = {}

  if (!projectUrl || !workspace.workspaceFolders)
    return result

  result.none = []
  result.packageJSON = PackageJSONParser.load(projectUrl)
  result.pubspecYAML = PubspecYAMLParser.load(projectUrl)
  result.composerJSON = ComposerJSONParser.load(projectUrl)
  result.gemfile = GemfileParser.load(projectUrl)

  return result
}

export function getEnabledFrameworks(dependencies: PackageDependencies, root: string) {
  const enabledFrameworks = frameworks.filter((framework) => {
    for (const k of Object.keys(dependencies)) {
      const key = k as PackageFileType
      const packages = dependencies[key]
      const req = framework.detection[key]

      if (packages && req) {
        if (typeof req === 'function') {
          return req(packages, root)
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

  for (const framework of enabledFrameworks) {
    if (framework.monopoly)
      return [framework]
  }

  return enabledFrameworks
}

export function getEnabledFrameworksByIds(ids: string[], root: string) {
  const missedFrameworks: string[] = []
  const enabledFrameworks = ids.flatMap((id) => {
    const framework = frameworks.find(f => f.id === id)
    if (!framework) {
      missedFrameworks.push(id)
      return []
    }

    if (framework instanceof CustomFramework)
      framework.load(root)

    return [framework]
  })

  if (missedFrameworks.length > 0)
    Log.warning(i18n.t('prompt.frameworks_not_found', missedFrameworks.join(', ')), true)

  return enabledFrameworks
}
