import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'
import { google } from 'translation.js'

import Common from './utils/Common'
import I18nParser from './utils/I18nParser'
import KeyDetector from './utils/KeyDetector'

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
              i18n: I18nParser.transByFile(filePath),
            },
          })
          break

        case EVENT_MAP.trans:
          data.forEach(async i18nItem => {
            try {
              const transItemsResult = await this.transByGoogle(i18nItem.items)
              webview.postMessage({
                type: EVENT_MAP.trans,
                data: {
                  ...i18nItem,
                  items: transItemsResult,
                },
              })
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
          console.log(data)
          break

        default:
        //
      }
    }
    webview.onDidReceiveMessage(onMessage)
  }

  transByGoogle(transItems): Promise<any> {
    const cnItem = transItems.find(transItem => transItem.lng === 'zh-CN')

    const tasks = transItems.map(transItem => {
      if (transItem.lng === 'zh-CN') return transItem

      return google
        .translate({
          from: 'zh-CN',
          to: transItem.lng,
          text: cnItem.str,
        })
        .then(res => {
          transItem.str = res.result[0]
          return transItem
        })
    })

    return Promise.all(tasks)
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
