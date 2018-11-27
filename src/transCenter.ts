import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'
import { google } from 'translation.js'

import Common from './utils/Common'
import i18nFiles from './utils/i18nFiles'

const EVENT_MAP = {
  ready: 'ready',
  allI18n: 'allI18n',
  trans: 'trans',
  writeTrans: 'writeTrans',
}

export class TransCenter {
  constructor(filePath: string) {
    const shortFileName = filePath
      .split(path.sep)
      .slice(-3)
      .join(path.sep)

    const panel = vscode.window.createWebviewPanel(
      'transCenter',
      `翻译-${shortFileName}`,
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      }
    )
    const { webview } = panel

    webview.html = fs.readFileSync(
      path.resolve(Common.extension.extensionPath, 'static/transCenter.html'),
      'utf-8'
    )

    const onMessage = ({ type, data }) => {
      switch (type) {
        case EVENT_MAP.ready:
          webview.postMessage({
            type: EVENT_MAP.allI18n,
            data: {
              filePath: shortFileName,
              i18n: i18nFiles.getTrans(filePath),
            },
          })
          break

        case EVENT_MAP.trans:
          data.forEach(async i18nItem => {
            try {
              const transItemsResult = await i18nFiles.getTransByGoogle(
                i18nItem.transItems
              )
              const newI18nItem = {
                ...i18nItem,
                transItems: transItemsResult,
              }
              webview.postMessage({
                type: EVENT_MAP.trans,
                data: newI18nItem,
              })
              i18nFiles.writeTrans(filePath, newI18nItem)
            } catch (err) {
              console.error('trans error', err)
              webview.postMessage({
                type: EVENT_MAP.trans,
                data: i18nItem,
              })
            }
          })
          break

        case EVENT_MAP.writeTrans:
          i18nFiles.writeTrans(filePath, data)
          break

        default:
        //
      }
    }
    webview.onDidReceiveMessage(onMessage)
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
