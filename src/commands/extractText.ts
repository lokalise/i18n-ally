// @ts-ignore
import * as limax from 'limax'
import { commands, window, workspace } from 'vscode'
import { trim } from 'lodash'
import { ExtensionModule } from '../modules'
import { ExtractTextOptions, Global, Commands } from '../core'
import i18n from '../i18n'

const m: ExtensionModule = () => {
  return commands.registerCommand(Commands.extract_text,
    async (options: ExtractTextOptions) => {
      const { filepath, text, range } = options
      const default_keypath = limax(text) as string

      // prompt for keypath
      const keypath = await window.showInputBox({
        prompt: i18n.t('prompt.enter_i18n_key'),
        value: default_keypath,
      })

      if (!keypath) {
        window.showWarningMessage(i18n.t('prompt.extraction_canceled'))
        return
      }

      // keypath existence check
      const node = Global.loader.getNodeByKey(keypath)
      let willSkip = false
      if (node) {
        const Override = i18n.t('prompt.button_override')
        const Skip = i18n.t('prompt.button_skip')
        const Reenter = i18n.t('prompt.button_reenter')
        const result = await window.showInformationMessage(
          i18n.t('prompt.key_already_exists'),
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
        'i18n.t(\'___\')',
        `${keypath}`,
      ]

      // prompt for template
      const replacer = await window.showQuickPick(templates, {
        placeHolder: i18n.t('prompt.replace_text_as'),
      })

      if (!replacer) {
        window.showWarningMessage(i18n.t('prompt.extraction_canceled'))
        return
      }

      // open editor if not exists
      let editor = window.activeTextEditor
      if (!editor) {
        const document = await workspace.openTextDocument(filepath)
        editor = await window.showTextDocument(document)
      }
      editor.edit((editBuilder) => {
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
