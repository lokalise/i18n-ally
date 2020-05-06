import * as path from 'path'
import { workspace, window, Selection, TextEditorRevealType, commands } from 'vscode'
import { LocaleTreeItem, ProgressRootItem } from '../../views'
import { Config, Global, CurrentFile } from '../../core'
import i18n from '../../i18n'
import { Log, NodeHelper } from '../../utils'
import { CommandOptions, getNodeOrRecord, getRecordFromNode } from './common'

export async function OpenKey(item?: LocaleTreeItem | CommandOptions | ProgressRootItem) {
  if (item instanceof ProgressRootItem) {
    const locale = item.locale
    const files = CurrentFile.loader.files.filter(f => f.locale === locale).map(f => f.filepath)
    let filepath: string| undefined
    if (files.length === 0) {
      return
    }
    else if (files.length === 1) {
      filepath = files[0]
    }
    else {
      filepath = await window.showQuickPick(files, {
        placeHolder: i18n.t('prompt.select_file_to_open'),
      })
    }
    if (!filepath)
      return

    const document = await workspace.openTextDocument(filepath)
    await window.showTextDocument(document)
  }
  else {
    const node = getNodeOrRecord(item)
    if (!node)
      return

    let locale: string | undefined = Config.displayLanguage

    if (node.type === 'node') {
      locale = await window.showQuickPick(
        Global.visibleLocales,
        { placeHolder: i18n.t('prompt.choice_locale') },
      )
    }

    if (!locale)
      return

    const record = await getRecordFromNode(node, locale)

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
    const range = parser.navigateToKey(text, NodeHelper.getPathWithoutNamespace(keypath, node), await Global.requestKeyStyle())

    if (range) {
      editor.selection = new Selection(
        document.positionAt(range.end),
        document.positionAt(range.start),
      )
      editor.revealRange(editor.selection, TextEditorRevealType.InCenter)
      commands.executeCommand('workbench.action.focusActiveEditorGroup')
    }
    else {
      Log.warning(i18n.t('prompt.failed_to_locate_key', keypath), true)
    }
  }
}
