import * as vscode from 'vscode'
import { join } from 'path'

const configPrefix = 'vue-i18n'

export default class Common {
  static get extension(): vscode.Extension<any> {
    return vscode.extensions.getExtension('think2011.vue-i18n')
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
}
