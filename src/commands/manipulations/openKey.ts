import * as path from 'path'
import { workspace, window, Selection, TextEditorRevealType, commands } from 'vscode'
import { LocaleTreeView } from '../../views/LocalesTreeView'
import { Config, Global } from '../../core'
import i18n from '../../i18n'
import { CommandOptions, getNode, getRecordFromNode } from './common'

export async function OpenKey (item?: LocaleTreeView | CommandOptions) {
  const node = getNode(item)
  if (!node)
    return

  const record = await getRecordFromNode(node, Config.displayLanguage)

  if (!record || !record.filepath)
    return

  const filepath = record.filepath
  const keypath = node.keypath

  const document = await workspace.openTextDocument(filepath)
  const editor = await window.showTextDocument(document)

  const ext = path.extname(filepath)
  const parser = Global.getMatchedParser(ext)
  if (!parser)
    return

  const text = editor.document.getText()
  const range = parser.navigateToKey(text, keypath, Config.keyStyle)

  if (range) {
    editor.selection = new Selection(
      document.positionAt(range.end),
      document.positionAt(range.start)
    )
    editor.revealRange(editor.selection, TextEditorRevealType.InCenter)
    commands.executeCommand('workbench.action.focusActiveEditorGroup')
  }
  else {
    window.showWarningMessage(i18n.t('prompt.failed_to_locate_key', keypath))
  }
}
