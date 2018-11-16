import * as vscode from 'vscode'

export default class Common {
  static get extension(): vscode.Extension<any> {
    return vscode.extensions.getExtension('think2011.vue-i18n')
  }
}
