import { window, commands, workspace, Selection, TextEditorRevealType, env } from 'vscode'
import { Global, Commands, LocaleRecord } from '../core'
import { ExtensionModule } from '../modules'
import { LocaleTreeItem, Node } from '../views/LocalesTreeView'
import * as path from 'path'
import { flatten } from 'lodash'

async function getRecordFromNode (node: Node, defaultLocale?: string) {
  if (node.type === 'tree')
    return

  if (node.type === 'record')
    return node

  if (node.type === 'node') {
    const locales = Global.loader.getShadowLocales(node)
    const locale = defaultLocale || await window.showQuickPick(
      Global.visibleLocales,
      { placeHolder: 'Choice a locale' }
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
        window.showInformationMessage('I18n key copied')
      }),

    commands.registerCommand(Commands.translate_key,
      async (item?: LocaleTreeItem) => {
        if (!item || !item.node)
          return

        if (item.node.type === 'tree')
          return

        try {
          const pendings = await Global.loader.MachineTranslate(item.node)
          if (pendings.length) {
            await Global.loader.writeToFile(pendings)
            window.showInformationMessage('Translation saved!')
          }
        }
        catch (err) {
          window.showErrorMessage(err.toString())
        }
      }),

    commands.registerCommand(Commands.open_key,
      async (item?: LocaleTreeItem) => {
        if (!item || !item.node)
          return

        const node = await getRecordFromNode(item.node, Global.displayLanguage)

        if (!node || !node.filepath)
          return

        const filepath = node.filepath
        const keypath = item.node.keypath

        const document = await workspace.openTextDocument(filepath)
        const editor = await window.showTextDocument(document)

        const ext = path.extname(filepath)
        const parser = Global.getMatchedParser(ext)
        if (!parser)
          return

        const text = editor.document.getText()
        const range = parser.navigateToKey(text, keypath)

        if (range) {
          editor.selection = new Selection(
            document.positionAt(range.end),
            document.positionAt(range.start)
          )
          editor.revealRange(editor.selection, TextEditorRevealType.InCenter)
          commands.executeCommand('workbench.action.focusActiveEditorGroup')
        }
        else {
          window.showWarningMessage(`Failed to locale key "${keypath}"`)
        }
      }),

    commands.registerCommand(Commands.edit_key,
      async (item?: LocaleTreeItem) => {
        if (!item || !item.node)
          return

        let node = item.node

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
            prompt: `Edit key "${node.keypath}" in ${node.locale}`,
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

    commands.registerCommand(Commands.rename_key,
      async ({ node }: LocaleTreeItem) => {
        let records: LocaleRecord[] = []

        if (node.type === 'tree')
          return

        else if (node.type === 'record')
          records = [node]

        else
          records = Object.values(node.locales)

        try {
          const newkeypath = await window.showInputBox({
            value: node.keypath,
            prompt: 'Enter the new keypath',
          })

          if (newkeypath !== undefined && newkeypath !== node.keypath) {
            const writes = flatten(records
              .map(record => [{
                value: undefined,
                keypath: record.keypath,
                filepath: record.filepath,
                locale: record.locale,
              }, {
                value: record.value,
                keypath: newkeypath,
                filepath: record.filepath,
                locale: record.locale,
              }]))
            await Global.loader.writeToFile(writes)
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
          await Global.loader.writeToFile(records.map(record => ({
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
