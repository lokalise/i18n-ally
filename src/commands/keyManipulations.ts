import { window, commands, workspace, Selection, TextEditorRevealType } from 'vscode'
import * as clipboardy from 'clipboardy'
import { Global, Commands } from '../core'
import { ExtensionModule } from '../modules'
import { LocaleTreeItem } from '../views/LocalesTreeView'

const m: ExtensionModule = (ctx) => {
  return [
    commands.registerCommand(Commands.copy_key,
      async ({ node }: LocaleTreeItem) => {
        await clipboardy.write(`$t('${node.keypath}')`)
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

          const indent = 2 // TODO: get indent from system settings
          const keys = node.keypath.split('.')

          // build regex to locale the key in json file
          let regexString = keys
            .map((key, i) => `^[ \\t]{${(i + 1) * indent}}"${key}": ?`)
            .join('[\\s\\S]*')
          regexString += '"(.*)"'
          const regex = new RegExp(regexString, 'gm')

          const text = editor.document.getText()
          const match = regex.exec(text)
          if (match && match.length >= 2) {
            const end = match.index + match[0].length - 1
            const value = match[1]
            const start = end - value.length
            editor.selection = new Selection(
              document.positionAt(end),
              document.positionAt(start)
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
