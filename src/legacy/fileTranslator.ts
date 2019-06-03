import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'

import Common from '../core/Common'
import i18nFiles from './i18nFiles'

const EVENT_MAP = {
  ready: 'ready',
  allI18n: 'allI18n',
  trans: 'trans',
  writeTrans: 'writeTrans',
  transSingle: 'transSingle',
}

export class FileTranslator {
  panel: vscode.WebviewPanel
  filePath: string
  shortFileName: string

  constructor (filePath: string) {
    this.filePath = filePath
    this.shortFileName = filePath
      .split(path.sep)
      .slice(-3)
      .join(path.sep)
  }

  init () {
    this.initPanel()
    this.initMessage()
    this.initFileWatcher()
  }

  initPanel () {
    this.panel = vscode.window.createWebviewPanel(
      'file-translator',
      `Translating-${this.shortFileName}`,
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        enableFindWidget: true,
        enableCommandUris: true,
        retainContextWhenHidden: true,
      }
    )

    const { webview } = this.panel

    webview.html = fs.readFileSync(
      path.resolve(Common.extension.extensionPath, 'static/file-translator.html'),
      'utf-8'
    )
  }

  initMessage () {
    const {
      panel: { webview },
      shortFileName,
      filePath,
    } = this

    const onMessage = ({ type, data }: {type: string; data: any}) => {
      switch (type) {
        case EVENT_MAP.ready:
          webview.postMessage({
            type: EVENT_MAP.allI18n,
            data: {
              filePath: shortFileName,
              i18n: i18nFiles.getTrans(filePath),
              sourceLanguage: Common.sourceLanguage,
            },
          })
          break

        case EVENT_MAP.trans:
          data.forEach(async ({ item, locales }) => {
            try {
              const transItemsResult = await i18nFiles.getTransByApi(
                item.transItems,
                locales,
                !!locales
              )
              const newI18nItem = {
                ...item,
                transItems: transItemsResult,
              }
              webview.postMessage({
                type: EVENT_MAP.trans,
                data: newI18nItem,
                locales,
              })
              i18nFiles.writeTrans(filePath, newI18nItem)
            }
            catch (err) {
              console.error(err)
              webview.postMessage({
                type: EVENT_MAP.trans,
                data: item,
                locales,
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

  initFileWatcher () {
    const {
      panel,
      panel: { webview },
      shortFileName,
      filePath,
    } = this
    const watcher = vscode.workspace.createFileSystemWatcher(filePath)

    const updateI18n = () => {
      webview.postMessage({
        type: EVENT_MAP.allI18n,
        data: {
          filePath: shortFileName,
          i18n: i18nFiles.getTrans(filePath),
        },
      })
    }

    watcher.onDidChange(updateI18n)
    panel.onDidDispose(() => watcher.dispose())
  }
}

export default (ctx: vscode.ExtensionContext) => {
  vscode.commands.executeCommand('setContext', 'vueI18nEnabled', true)

  const cmd = vscode.commands.registerCommand(
    'extension.vue-i18n-ally.file-translator',
    () => {
      const filename = vscode.window.activeTextEditor.document.fileName
      const translator = new FileTranslator(filename)
      translator.init()
    }
  )

  ctx.subscriptions.push(cmd)
}
