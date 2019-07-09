import { window, commands, workspace, Selection, TextEditorRevealType, env } from 'vscode'
import { Global, Commands, LocaleRecord, Node } from '../core'
import { ExtensionModule } from '../modules'
import { decorateLocale } from '../utils'
import { LocaleTreeItem } from '../views/LocalesTreeView'
import * as path from 'path'
import i18n from '../i18n'

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
  return Global.loader.getRecordByKey(item.keypath, item.locale, true)
}

async function getRecordFromNode (node: Node, defaultLocale?: string) {
  if (node.type === 'tree')
    return

  if (node.type === 'record')
    return node

  if (node.type === 'node') {
    const locales = Global.loader.getShadowLocales(node)
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

        const from = (item && !(item instanceof LocaleTreeItem) && item.from) || Global.sourceLanguage

        try {
          const pendings = await Global.loader.MachineTranslate(node, from)
          if (pendings.length) {
            await Global.loader.writeToFile(pendings)
            window.showInformationMessage(i18n.t('prompt.translation_saved'))
          }
        }
        catch (err) {
          window.showErrorMessage(err.toString())
        }
      }),

    commands.registerCommand(Commands.open_key,
      async (item?: LocaleTreeItem | CommandOptions) => {
        const node = getNode(item)
        if (!node)
          return

        const record = await getRecordFromNode(node, Global.displayLanguage)

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
        const range = parser.navigateToKey(text, keypath, Global.keyStyle)

        if (range) {
          editor.selection = new Selection(
            document.positionAt(range.end),
            document.positionAt(range.start)
          )
          editor.revealRange(editor.selection, TextEditorRevealType.InCenter)
          commands.executeCommand('workbench.action.focusActiveEditorGroup')
        }
        else {
          window.showWarningMessage(i18n.t('prompt.failed_to_locale_key', keypath))
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
          const record = await getRecordFromNode(node, Global.displayLanguage)
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
            await Global.loader.writeToFile({
              value: newvalue,
              keypath: node.keypath,
              filepath: node.filepath,
              locale: node.locale,
            })
          }
        }
        catch (err) {
          window.showErrorMessage(err.toString())
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
          await Global.loader.writeToFile(records
            .filter(record => !record.shadow)
            .map(record => ({
              value: undefined,
              keypath: record.keypath,
              filepath: record.filepath,
              locale: record.locale,
            })))
        }
        catch (err) {
          window.showErrorMessage(err.toString())
        }
      }),
  ]
}

export default m
