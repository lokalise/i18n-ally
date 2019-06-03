import { window, commands } from 'vscode'
import * as clipboardy from 'clipboardy'
import { Common, LocaleNode, LocaleRecord } from '../core'
import { ExtensionModule } from '../modules'
import { Item } from '../views/LocalesTreeView'
import { Command } from './Command'

const m: ExtensionModule = (ctx) => {
  return [
    commands.registerCommand(Command.copy_key,
      async ({ node }: { node: LocaleNode }) => {
        await clipboardy.write(`$t('${node.keypath}')`)
        window.showInformationMessage('I18n key copied')
      }),

    commands.registerCommand(Command.translate_key,
      async ({ node }: Item) => {
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

    commands.registerCommand(Command.edit_key,
      async ({ node }: { node: LocaleRecord }) => {
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
