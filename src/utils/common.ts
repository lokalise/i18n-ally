import * as vscode from 'vscode'
import { join } from 'path'

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

  static getConfig(key): any {
    return vscode.workspace.getConfiguration().get(`${configPrefix}.${key}`)
  }

  static setConfig(key, value, isGlobal = false) {
    return vscode.workspace
      .getConfiguration()
      .update(`${configPrefix}.${key}`, value, isGlobal)
  }

  public static isVueProject(): Boolean {
    const projectUrl = vscode.workspace.workspaceFolders[0].uri.path

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
}
