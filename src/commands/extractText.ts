// @ts-ignore
import * as limax from 'limax'
import { commands, window, workspace } from 'vscode'
import { trim } from 'lodash'
import { ExtensionModule } from '../modules'
import { ExtractTextOptions, Global, Commands, Config, CurrentFile } from '../core'
import i18n from '../i18n'

const m: ExtensionModule = () => {
  return commands.registerCommand(Commands.extract_text,
    async (options: ExtractTextOptions) => {
      const { filepath, text, range, languageId } = options
      const default_keypath = limax(text, { separator: Config.preferredDelimiter, tone: false }) as string

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
          Reenter,
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

      // prompt for template
      const replacer = await window.showQuickPick(
        Global.refactorTemplates(keypath, languageId),
        {
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
        editBuilder.replace(range, replacer)
      })

      if (willSkip)
        return

      // save key
      await CurrentFile.loader.write({
        filepath: undefined,
        keypath,
        value,
        locale: Config.sourceLanguage,
      })
    })
}

export default m
