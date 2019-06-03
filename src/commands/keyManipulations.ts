import { window, commands, workspace } from 'vscode'
import * as clipboardy from 'clipboardy'
import { Common } from '../core'
import { ExtensionModule } from '../modules'
import { LocaleTreeItem } from '../views/LocalesTreeView'
import { Command } from './Command'

const m: ExtensionModule = (ctx) => {
  return [
    commands.registerCommand(Command.copy_key,
      async ({ node }: LocaleTreeItem) => {
        await clipboardy.write(`$t('${node.keypath}')`)
        window.showInformationMessage('I18n key copied')
      }),

    commands.registerCommand(Command.translate_key,
      async ({ node }: LocaleTreeItem) => {
        if (node.type === 'tree')
          return

        try {
          const pendings = await Common.loader.MachineTranslate(node)
          if (pendings.length) {
            await Common.loader.writeToFile(pendings)
            window.showInformationMessage('Translation saved!')
          }
        }
        catch (err) {
          window.showErrorMessage(err.toString())
        }
      }),

    commands.registerCommand(Command.open_key,
      async ({ node }: LocaleTreeItem) => {
        if (node.type !== 'record')
          return

        console.log('OPENING', node.filepath)

        if (node.filepath) {
          const document = await workspace.openTextDocument(node.filepath)
          // eslint-disable-next-line
          const editor = await window.showTextDocument(document)
          // TODO: navigate to the key
        }
      }),

    commands.registerCommand(Command.edit_key,
      async ({ node }: LocaleTreeItem) => {
        if (node.type !== 'record')
          return

        try {
          const newvalue = await window.showInputBox({
            value: node.value,
            prompt: `Edit key "${node.keypath}" on ${node.locale}`,
          })

          if (newvalue !== undefined && newvalue !== node.value) {
            await Common.loader.writeToFile({
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
