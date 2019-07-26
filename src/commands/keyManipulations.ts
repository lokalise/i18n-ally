import * as path from 'path'
import { window, commands, workspace, Selection, TextEditorRevealType, env } from 'vscode'
import { Global, Commands, LocaleRecord, Node, Config, CurrentFile } from '../core'
import { ExtensionModule } from '../modules'
import { decorateLocale, Log } from '../utils'
import { LocaleTreeItem } from '../views/LocalesTreeView'
import i18n from '../i18n'
import { Translator } from '../core/Translator'

interface CommandOptions {
  keypath: string
  locale: string
  from?: string
}

function getNode (item?: LocaleTreeItem | CommandOptions) {
  if (!item)
    return

  if (item instanceof LocaleTreeItem)
    return item.node
  return CurrentFile.loader.getRecordByKey(item.keypath, item.locale, true)
}

async function getRecordFromNode (node: Node, defaultLocale?: string) {
  if (node.type === 'tree')
    return

  if (node.type === 'record')
    return node

  if (node.type === 'node') {
    const locales = CurrentFile.loader.getShadowLocales(node)
    const locale = defaultLocale || await window.showQuickPick(
      Global.visibleLocales,
      { placeHolder: i18n.t('prompt.choice_locale') }
    )
    if (!locale)
      return
    return locales[locale]
  }
}

const m: ExtensionModule = (ctx) => {
  return [
    commands.registerCommand(Commands.copy_key,
      async ({ node }: LocaleTreeItem) => {
        // @ts-ignore
        await env.clipboard.writeText(`$t('${node.keypath}')`)
        window.showInformationMessage(i18n.t('prompt.key_copied'))
      }),

    commands.registerCommand(Commands.translate_key,
      async (item?: LocaleTreeItem | CommandOptions) => {
        const node = getNode(item)
        if (!node)
          return

        if (node.type === 'tree')
          return

        const from = (item && !(item instanceof LocaleTreeItem) && item.from) || Config.sourceLanguage

        try {
          await Translator.MachineTranslate(CurrentFile.loader, node, from) // TODO:sfc
        }
        catch (err) {
          Log.error(err.toString())
        }
      }),

    commands.registerCommand(Commands.open_key,
      async (item?: LocaleTreeItem | CommandOptions) => {
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
      }),

    commands.registerCommand(Commands.rename_key,
      async (item?: LocaleTreeItem | string) => {
        if (!item)
          return

        let node: Node | undefined

        if (typeof item === 'string')
          node = CurrentFile.loader.getTreeNodeByKey(item)
        else
          node = item.node

        if (!node)
          return

        try {
          const oldkeypath = node.keypath
          const newkeypath = await window.showInputBox({
            value: oldkeypath,
            prompt: i18n.t('prompt.enter_new_keypath'),
          })

          if (!newkeypath)
            return

          const edit = await Global.loader.renameKey(oldkeypath, newkeypath) // TODO:sfc
          await workspace.applyEdit(edit)
        }
        catch (err) {
          Log.error(err)
        }
      }),

    commands.registerCommand(Commands.edit_key,
      async (item?: LocaleTreeItem | CommandOptions) => {
        let node = getNode(item)

        if (!node)
          return

        if (node.type === 'tree')
          return

        if (node.type === 'node') {
          const record = await getRecordFromNode(node, Config.displayLanguage)
          if (!record)
            return
          node = record
        }

        try {
          const newvalue = await window.showInputBox({
            value: node.value,
            prompt: i18n.t('prompt.edit_key_in_locale', node.keypath, decorateLocale(node.locale)),
          })

          if (newvalue !== undefined && newvalue !== node.value) {
            await Global.loader.writeToFile({ // TODO:sfc
              value: newvalue,
              keypath: node.keypath,
              filepath: node.filepath,
              locale: node.locale,
            })
          }
        }
        catch (err) {
          Log.error(err.toString())
        }
      }),

    commands.registerCommand(Commands.delete_key,
      async ({ node }: LocaleTreeItem) => {
        let records: LocaleRecord[] = []

        if (node.type === 'tree')
          return

        else if (node.type === 'record')
          records = [node]

        else
          records = Object.values(node.locales)

        try {
          await Global.loader.writeToFile(records // TODO:sfc
            .filter(record => !record.shadow)
            .map(record => ({
              value: undefined,
              keypath: record.keypath,
              filepath: record.filepath,
              locale: record.locale,
            })))
        }
        catch (err) {
          Log.error(err.toString())
        }
      }),
  ]
}

export default m
