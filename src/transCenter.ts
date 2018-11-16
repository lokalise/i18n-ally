import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'
import Common from './utils/common'

export class TransCenter {
  constructor(filePath: string) {
    console.log(filePath)
    const panel = vscode.window.createWebviewPanel(
      'transCenter',
      '翻译中心',
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      }
    )

    panel.webview.html = fs.readFileSync(
      path.resolve(Common.extension.extensionPath, 'static/transCenter.html'),
      'utf-8'
    )
  }
}

export default (ctx: vscode.ExtensionContext) => {
  const cmd = vscode.commands.registerCommand(
    'extension.vue-i18n.transCenter',
    (uri: vscode.Uri) => {
      new TransCenter(uri.path)
    }
  )

  ctx.subscriptions.push(cmd)
}
