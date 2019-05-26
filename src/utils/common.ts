import * as vscode from 'vscode'
import lngs from './lngs'

const configPrefix = 'vue-i18n-ally'

export default class Common {
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

  static get displayLocale (): string {
    return Common.normalizeLng(Common.getConfig('displayLocale')) || 'en'
  }

  static get sourceLocale (): string {
    return Common.normalizeLng(Common.getConfig('sourceLocale')) || this.displayLocale || 'en'
  }

  static getConfig (key: string): any {
    return vscode.workspace.getConfiguration().get(`${configPrefix}.${key}`)
  }

  static setConfig (key: string, value: any, isGlobal = false) {
    return vscode.workspace
      .getConfiguration()
      .update(`${configPrefix}.${key}`, value, isGlobal)
  }

  static normalizeLng (lng: string): string {
    const result = lngs.find((lngItem: string | string[]) => {
      if (Array.isArray(lngItem) && lngItem[1].includes(lng))
        return true

      if (
        typeof lngItem === 'string' &&
        lng.toUpperCase() === lngItem.toUpperCase()
      )
        return true
    })

    return result ? (Array.isArray(result) ? result[0].toString() : result) : ''
  }

  public static isVueProject (): boolean {
    if (!vscode.workspace.workspaceFolders)
      return false
    const projectUrl = this.rootPath

    try {
      /* eslint-disabled @typescir */
      const {
        dependencies,
        devDependencies,
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
