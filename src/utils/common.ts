import * as vscode from 'vscode'
import { join } from 'path'
import lngs from './lngs'

const configPrefix = 'vue-i18n'

export default class Common {
  static get extension(): vscode.Extension<any> {
    return vscode.extensions.getExtension('think2011.vue-i18n')
  }

  public static get hasI18nPaths() {
    return !!Common.i18nPaths.length
  }

  static get i18nPaths() {
    const paths = Common.getConfig('i18nPaths')

    return paths ? paths.split(',') : []
  }

  static updateI18nPaths(paths: string[]) {
    const i18nPaths = [...new Set(Common.i18nPaths.concat(paths))]
    Common.setConfig('i18nPaths', i18nPaths.join(','))
  }

  static getSourceLocale() {
    return Common.normalizeLng(Common.getConfig('sourceLocale')) || 'zh-CN'
  }

  static getConfig(key): any {
    return vscode.workspace.getConfiguration().get(`${configPrefix}.${key}`)
  }

  static setConfig(key, value, isGlobal = false) {
    return vscode.workspace
      .getConfiguration()
      .update(`${configPrefix}.${key}`, value, isGlobal)
  }

  static normalizeLng(lng) {
    const result = lngs.find((lngItem: string | string[]) => {
      if (Array.isArray(lngItem) && lngItem[1].includes(lng)) {
        return true
      }

      if (
        typeof lngItem === 'string' &&
        lng.toUpperCase() === lngItem.toUpperCase()
      ) {
        return true
      }
    })

    return result ? (Array.isArray(result) ? result[0] : result) : ''
  }

  public static isVueProject(): Boolean {
    const projectUrl = vscode.workspace.workspaceFolders[0].uri.fsPath

    try {
      const {
        dependencies,
        devDependencies
      } = require(`${projectUrl}/package.json`)
      return !!dependencies['vue-i18n'] || !!devDependencies['vue-i18n']
    } catch (err) {
      return false
    }
  }

  public static getUid(len = 6): string {
    return Math.random()
      .toString(36)
      .substr(2, len)
  }
}
