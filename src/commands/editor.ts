import { commands, window } from 'vscode'
import { EditorPanel } from '../webview/panel'
import { Commands, CurrentFile } from '../core'
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
  const openEditor = async(item?: string | LocaleTreeItem | CommandOptions) => {
    let key: string | undefined

    if (!item) {
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
    else if (item instanceof LocaleTreeItem) {
      key = item.node.keypath
    }
    else if (typeof item === 'string') {
      key = item
    }
    else if (item.keypath) {
      key = item.keypath
    }

    if (!key)
      return

    const panel = EditorPanel.createOrShow(ctx, {})
    panel.editKey(key)
  }

  return [
    commands.registerCommand(Commands.open_in_editor, openEditor),
    commands.registerCommand(Commands.open_editor, openEditor),
  ]
}

export default m
