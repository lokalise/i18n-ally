import * as vscode from 'vscode'
import LanguageCodes from './LanguageCodes'
import { LocaleLoader } from '../core'

const configPrefix = 'vue-i18n-ally'

export default class Common {
  static loader: LocaleLoader

  static get extension (): vscode.Extension<any> {
    return vscode.extensions.getExtension('antfu.vue-i18n-ally') as vscode.Extension<any>
  }

  static get hasI18nPaths () {
    return !!Common.localesPaths.length
  }

  static get localesPaths (): string[] {
    const paths = Common.getConfig('localesPaths')

    return paths ? paths.split(',') : []
  }

  static updateLocalesPaths (paths: string[]) {
    const localesPaths = [...new Set(Common.localesPaths.concat(paths))]
    Common.setConfig('localesPaths', localesPaths.join(','))
  }

  static get rootPath () {
    return vscode.workspace.workspaceFolders[0].uri.fsPath
  }

  static get displayLanguage (): string {
    return Common.normalizeLng(Common.getConfig('displayLanguage'))
  }

  static set displayLanguage (value) {
    Common.setConfig('displayLanguage', Common.normalizeLng(value))
  }

  static get sourceLanguage (): string {
    return Common.normalizeLng(Common.getConfig('sourceLanguage'), '') || this.displayLanguage || 'en'
  }

  static getConfig (key: string): any {
    return vscode.workspace.getConfiguration().get(`${configPrefix}.${key}`)
  }

  static setConfig (key: string, value: any, isGlobal = false) {
    return vscode.workspace
      .getConfiguration()
      .update(`${configPrefix}.${key}`, value, isGlobal)
  }

  static normalizeLng (lng: string, fallback = 'en'): string {
    const result = LanguageCodes.find((lngItem: string | string[]) => {
      if (Array.isArray(lngItem) && lngItem[1].includes(lng))
        return true

      if (
        typeof lngItem === 'string' &&
        lng.toUpperCase() === lngItem.toUpperCase()
      )
        return true

      return false
    })

    return result ? (Array.isArray(result) ? result[0].toString() : result) : fallback
  }

  public static isVueProject (): boolean {
    if (!vscode.workspace.workspaceFolders)
      return false
    const projectUrl = this.rootPath

    try {
      const {
        dependencies,
        devDependencies,
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      } = require(`${projectUrl}/package.json`)
      return !!dependencies['vue-i18n'] || !!devDependencies['vue-i18n']
    }
    catch (err) {
      return false
    }
  }

  public static getUid (len = 6): string {
    return Math.random()
      .toString(36)
      .substr(2, len)
  }
}
