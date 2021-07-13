import { commands, window, ViewColumn, workspace, TextDocument } from 'vscode'
import { EditorPanel } from '../webview/panel'
import { LocaleTreeItem } from '../views'
import { Commands } from './commands'
import { CommandOptions } from './manipulations/common'
import { ExtensionModule } from '~/modules'
import i18n from '~/i18n'
import { ActionSource, Global, Telemetry, TelemetryKey } from '~/core'
import { promptKeys } from '~/utils'

export default <ExtensionModule> function(ctx) {
  // if the editor is bind with current document

  const supportedFileOpen = () => {
    const doc = window.activeTextEditor?.document

    if (!doc || !Global.isLanguageIdSupported(doc.languageId))
      return false

    return true
  }

  const openEditor = async(item?: string | LocaleTreeItem | CommandOptions) => {
    let actionSource = ActionSource.None

    let key: string | undefined
    let locale: string | undefined
    let mode: EditorPanel['mode'] = 'standalone'
    let index: number | undefined

    // from command pattele
    if (!item) {
      actionSource = ActionSource.CommandPattele
      if (supportedFileOpen())
        mode = 'currentFile'

      key = await promptKeys(i18n.t('prompt.choice_key_to_open'))
    }
    // from tree view
    else if (item instanceof LocaleTreeItem) {
      actionSource = ActionSource.TreeView
      key = item.node.keypath
      locale = item.node.type === 'record' ? item.node.locale : undefined
    }
    // from internal command call
    else if (typeof item === 'string') {
      key = item
    }
    // from hover
    else if (item.keypath) {
      actionSource = ActionSource.Hover
      key = item.keypath
      locale = item.locale
      if (item.keyIndex != null) {
        mode = 'currentFile'
        index = item.keyIndex
      }
    }

    if (!key)
      return

    if (actionSource !== ActionSource.None)
      Telemetry.track(TelemetryKey.EditorOpen, { source: actionSource })

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
