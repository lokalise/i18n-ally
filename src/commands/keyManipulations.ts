import { window, commands, workspace, Selection, TextEditorRevealType, env } from 'vscode'
import { Global, Commands } from '../core'
import { ExtensionModule } from '../modules'
import { LocaleTreeItem } from '../views/LocalesTreeView'
import * as path from 'path'

const m: ExtensionModule = (ctx) => {
  return [
    commands.registerCommand(Commands.copy_key,
      async ({ node }: LocaleTreeItem) => {
        // @ts-ignore
        await env.clipboard.writeText(`$t('${node.keypath}')`)
        window.showInformationMessage('I18n key copied')
      }),

    commands.registerCommand(Commands.translate_key,
      async ({ node }: LocaleTreeItem) => {
        if (node.type === 'tree')
          return

        try {
          const pendings = await Global.loader.MachineTranslate(node)
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
      async ({ node }: LocaleTreeItem) => {
        if (node.type !== 'record')
          return

        if (node.filepath) {
          const document = await workspace.openTextDocument(node.filepath)
          const editor = await window.showTextDocument(document)

          const ext = path.extname(node.filepath)
          const parser = Global.getMatchedParser(ext)
          if (!parser)
            return

          const text = editor.document.getText()
          const range = parser.navigateToKey(text, node.keypath)

          if (range) {
            editor.selection = new Selection(
              document.positionAt(range.end),
              document.positionAt(range.start)
            )
            editor.revealRange(editor.selection, TextEditorRevealType.InCenter)
            commands.executeCommand('workbench.action.focusActiveEditorGroup')
          }
          else {
            window.showWarningMessage(`Failed to locale key "${node.keypath}"`)
          }
        }
      }),

    commands.registerCommand(Commands.edit_key,
      async ({ node }: LocaleTreeItem) => {
        if (node.type !== 'record')
          return

        try {
          const newvalue = await window.showInputBox({
            value: node.value,
            prompt: `Edit key "${node.keypath}" on ${node.locale}`,
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
  ]
}

export default m
