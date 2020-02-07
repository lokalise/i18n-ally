// @ts-ignore
import { commands, window, workspace } from 'vscode'
import { ExtensionModule } from '../modules'
import { ExtractTextOptions, Global, Commands, Config, CurrentFile } from '../core'
import i18n from '../i18n'
import { overrideConfirm } from './overrideConfirm'
import { keypathValidate } from './keypathValidate'
import { trim } from 'lodash'
import * as limax from 'limax'

const m: ExtensionModule = () => {
  return commands.registerCommand(Commands.extract_text,
    async(options: ExtractTextOptions) => {
      const { filepath, text, range, languageId } = options
      const default_keypath = limax(text, { separator: Config.preferredDelimiter, tone: false }) as string
      const locale = Config.sourceLanguage

      // prompt for keypath
      const keypath = await window.showInputBox({
        prompt: i18n.t('prompt.enter_i18n_key'),
        value: default_keypath,
      })

      if (!keypath) {
        window.showWarningMessage(i18n.t('prompt.extraction_canceled'))
        return
      }

      if (!keypathValidate(keypath))
        return window.showWarningMessage(i18n.t('prompt.invalid_keypath'))

      const writeKeypath = CurrentFile.loader.rewriteKeys(keypath, 'write', { locale })

      const shouldOverride = await overrideConfirm(writeKeypath, true, true)

      if (shouldOverride === 'retry') {
        commands.executeCommand(Commands.extract_text, options)
        return
      }
      if (shouldOverride === 'canceled')
        return

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

      if (shouldOverride === 'skip')
        return

      // save key
      await CurrentFile.loader.write({
        filepath: undefined,
        keypath: writeKeypath,
        value,
        locale,
      })
    })
}

export default m
