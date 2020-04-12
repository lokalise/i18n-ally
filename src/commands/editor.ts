import { commands, WebviewPanel, window } from 'vscode'
import { EditorPanel } from '../webview/panel'
import { Commands } from '../core'
import { ExtensionModule } from '../modules'
import { LocaleTreeItem } from '../views'

const m: ExtensionModule = (ctx) => {
  window.registerWebviewPanelSerializer(EditorPanel.viewType, {
    async deserializeWebviewPanel(panel: WebviewPanel, options: any) {
      EditorPanel.revive(ctx, options, panel)
    },
  })

  return [
    commands.registerCommand(Commands.open_in_editor,
      async(item?: string | LocaleTreeItem) => {
        const panel = EditorPanel.createOrShow(ctx, {})

        if (!item)
          return

        if (item instanceof LocaleTreeItem)
          item = item.node.keypath

        panel.editKey(item)
      }),
  ]
}

export default m
