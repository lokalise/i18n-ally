import { commands, window, workspace } from 'vscode'
// @ts-ignore
import * as limax from 'limax'
import { trim } from 'lodash'
import { nanoid } from 'nanoid'
import { ExtensionModule } from '../modules'
import { Commands, Config, CurrentFile } from '../core'
import i18n from '../i18n'
import { ExtractTextOptions } from '../editor/extract'
import { promptTemplates } from '../utils'
import { overrideConfirm } from './overrideConfirm'
import { keypathValidate } from './keypathValidate'

const m: ExtensionModule = () => {
  return commands.registerCommand(Commands.extract_text,
    async(options?: ExtractTextOptions) => {
      if (!options) {
        // execute from command palette, get from active document
        const editor = window.activeTextEditor
        const document = editor?.document
        if (!editor || !document || editor.selection.start.isEqual(editor.selection.end))
          return
        options = {
          filepath: document.uri.fsPath,
          text: document.getText(editor.selection),
          range: editor.selection,
          languageId: document.languageId,
        }
      }

      const { filepath, text, range, languageId } = options
      let default_keypath: string
      const keygenStrategy = Config.keygenStrategy
      const keyPrefix = Config.keyPrefix

      if (keygenStrategy === 'random')
        default_keypath = nanoid()
      else
        default_keypath = limax(text, { separator: Config.preferredDelimiter, tone: false }) as string

      if (keyPrefix)
        default_keypath = keyPrefix + default_keypath

      const locale = Config.sourceLanguage

      // prompt for keypath
      const keypath = await window.showInputBox({
        prompt: i18n.t('prompt.enter_i18n_key'),
        value: default_keypath,
        ignoreFocusOut: true,
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
      const replacer = await promptTemplates(keypath, languageId)

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
        textFromPath: filepath,
        filepath: undefined,
        keypath: writeKeypath,
        value,
        locale,
      })
    })
}

export default m
