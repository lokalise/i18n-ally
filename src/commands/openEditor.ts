import { commands, window, ViewColumn, workspace, TextDocument } from 'vscode'
import { promptKeys } from '../utils'
import { EditorPanel } from '../webview/panel'
import { Commands, Global } from '../core'
import { ExtensionModule } from '../modules'
import { LocaleTreeItem } from '../views'
import i18n from '../i18n'
import { CommandOptions } from './manipulations/common'

const m: ExtensionModule = (ctx) => {
  /*
  window.registerWebviewPanelSerializer(EXT_EDITOR_ID, {
    async deserializeWebviewPanel(panel: WebviewPanel, options: any) {
      EditorPanel.revive(ctx, options, panel)
    },
  })
  */

  // if the editor is bind with current document

  const supportedFileOpen = () => {
    const doc = window.activeTextEditor?.document

    if (!doc || !Global.isLanguageIdSupported(doc.languageId))
      return false

    return true
  }

  const openEditor = async(item?: string | LocaleTreeItem | CommandOptions) => {
    let key: string | undefined
    let locale: string | undefined
    let mode: EditorPanel['mode'] = 'standalone'
    let index: number | undefined

    // from code pattele
    if (!item) {
      if (!supportedFileOpen()) {
        key = await promptKeys(i18n.t('prompt.choice_key_to_open'))
        if (!key)
          return
      }
      else {
        mode = 'currentFile'
      }
    }
    // from tree view
    else if (item instanceof LocaleTreeItem) {
      key = item.node.keypath
      locale = item.node.type === 'record' ? item.node.locale : undefined
    }
    // from internal command call
    else if (typeof item === 'string') {
      key = item
    }
    // from hover or comand call
    else if (item.keypath) {
      key = item.keypath
      locale = item.locale
      if (item.keyIndex != null) {
        mode = 'currentFile'
        index = item.keyIndex
      }
    }

    if (!key)
      return

    const panel = EditorPanel.createOrShow(ctx, mode === 'currentFile' ? ViewColumn.Two : undefined)
    panel.mode = mode
    panel.openKey(key, locale, index)
  }

  function updateContext(doc?: TextDocument) {
    if (
      Global.enabled
      && doc
      && window.activeTextEditor?.document === doc
      && EditorPanel.currentPanel?.visible
      && supportedFileOpen()
    )
      EditorPanel.currentPanel.sendCurrentFileContext()
  }

  return [
    commands.registerCommand(Commands.open_in_editor, openEditor),
    commands.registerCommand(Commands.open_editor, openEditor),
    workspace.onDidSaveTextDocument(updateContext),
    window.onDidChangeActiveTextEditor(e => updateContext(e?.document)),
  ]
}

export default m
