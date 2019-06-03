// @ts-ignore
import * as limax from 'limax'
import { commands, window, workspace } from 'vscode'
import { ExtensionModule } from '../modules'
import { Commands } from '.'
import { ExtractTextOptions, Global } from '../core'
import { trim } from 'lodash'

const m: ExtensionModule = () => {
  return commands.registerCommand(Commands.extract_text,
    async (options: ExtractTextOptions) => {
      const { filepath, text, range } = options
      const default_keypath = limax(text) as string

      // prompt for keypath
      const keypath = await window.showInputBox({
        prompt: 'Enter the i18n key path (for example: home.document.title)',
        value: default_keypath,
      })

      if (!keypath) {
        window.showWarningMessage('Extraction canceled')
        return
      }

      // keypath existence check
      const node = Global.loader.getNodeByKey(keypath)
      let willSkip = false
      if (node) {
        const Override = 'Override'
        const Skip = 'Continue with out override'
        const Reenter = 'Re-enter'
        const result = await window.showInformationMessage(
          'Key path already exists. Do you want to override the existing value or re-enter the path?',
          { modal: true },
          Override,
          Skip,
          Reenter
        )

        // canceled
        if (!result) {
          return
        }
        else if (result === Reenter) {
          commands.executeCommand(Commands.extract_text, options)
          return
        }
        else if (result === Skip) {
          willSkip = true
        }
        // else override
      }

      const value = trim(text, '\'"')

      const templates = [
        '{{$t(\'___\')}}',
        'this.$t(\'___\')',
        '$t("___")',
        `${keypath}`,
      ]

      // prompt for template
      const replacer = await window.showQuickPick(templates, {
        placeHolder: 'Replace text as:',
      })

      if (!replacer) {
        window.showWarningMessage('Extraction canceled')
        return
      }

      // open editor if not exists
      let editor = window.activeTextEditor
      if (!editor) {
        const document = await workspace.openTextDocument(filepath)
        editor = await window.showTextDocument(document)
      }
      editor.edit(editBuilder => {
        editBuilder.replace(range, replacer.replace('___', keypath))
      })

      if (willSkip)
        return

      // save key
      await Global.loader.writeToFile({
        filepath: undefined,
        keypath,
        value,
        locale: Global.sourceLanguage,
      })
    })
}

export default m
