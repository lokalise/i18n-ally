import { commands, window, ViewColumn } from 'vscode'
import { EditorPanel, OpenKeyOptions, EditorContext } from '../webview/panel'
import { Commands, CurrentFile, Global, KeyDetector } from '../core'
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
  const openEditor = async(item?: string | LocaleTreeItem | CommandOptions, options?: OpenKeyOptions) => {
    let key: string | undefined
    let context: EditorContext | undefined
    let column: ViewColumn | undefined

    const getContext = (keyIndex = 0) => {
      const doc = window.activeTextEditor?.document

      if (!doc || !Global.isLanguageIdSupported(doc.languageId))
        return false

      const keys = KeyDetector.getKeys(doc) || []
      if (!keys.length)
        return false

      context = {
        filepath: doc.uri.fsPath,
        keys,
      }
      key = keys[keyIndex].key
      column = ViewColumn.Two
      return true
    }

    if (!item) {
      if (!getContext()) {
        const result = await window.showQuickPick(CurrentFile.loader.keys.map(key => ({
          label: key,
        })), {
          ignoreFocusOut: true,
          placeHolder: i18n.t('prompt.choice_key_to_open'),
        })
        if (!result)
          return
        key = result.label
      }
    }
    else if (item instanceof LocaleTreeItem) {
      key = item.node.keypath
    }
    else if (typeof item === 'string') {
      key = item
    }
    else if (item.keypath) {
      key = item.keypath
      if (item.keyIndex != null)
        getContext(item.keyIndex)
    }

    if (!key)
      return

    const panel = EditorPanel.createOrShow(ctx, column)
    panel.openKey(key, options)
    panel.setContext(context)
  }

  return [
    commands.registerCommand(Commands.open_in_editor, openEditor),
    commands.registerCommand(Commands.open_editor, openEditor),
  ]
}

export default m
