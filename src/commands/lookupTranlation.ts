import { commands, window, workspace, QuickPickItem } from 'vscode'
// @ts-ignore
import { trim } from 'lodash'
import { ExtensionModule } from '../modules'
import { Commands, Config, CurrentFile } from '../core'
import i18n from '../i18n'
import { ExtractTextOptions } from '../editor/extract'
import { promptTemplates } from '../utils'

interface QuickPickItemWithType extends QuickPickItem {
  type: 'default' | 'new'
}

const m: ExtensionModule = () => {
  return commands.registerCommand(Commands.lookup_translation,
    async(options?: ExtractTextOptions) => {
      if (!options) {
        // execute from command palette, get from active document
        const editor = window.activeTextEditor
        const document = editor?.document
        // Removed "|| editor.selection.start.isEqual(editor.selection.end)" because open when nothing is selected
        if (!editor || !document)
          return

        options = {
          filepath: document.uri.fsPath,
          text: document.getText(editor.selection),
          range: editor.selection,
          languageId: document.languageId,
        }
      }
      const { filepath, text, range, languageId } = options

      // create the quickPickItems out of the Key Value pair from the sourceLanguage i18n locales json
      const quickPickItems: QuickPickItemWithType[] = CurrentFile.loader.keys.map(key => ({
        label: key,
        description: CurrentFile.loader.getValueByKey(key, Config.sourceLanguage),
        type: 'default',
      }))

      // Create and Init
      const quickPick = window.createQuickPick<QuickPickItemWithType>()
      quickPick.ignoreFocusOut = true
      quickPick.canSelectMany = false
      quickPick.matchOnDescription = true
      quickPick.value = trim(text, '\'"')
      quickPick.items = [{ label: quickPick.value, description: i18n.t('prompt.new_key_with_value', quickPick.value), alwaysShow: true, type: 'new' }, ...quickPickItems]

      quickPick.show()

      quickPick.onDidAccept(async() => {
        // if alwaysShow is true Create a new keypath is selected than execute the extract.text Command
        if (quickPick.activeItems[0].type === 'new') {
          if (options)
            options.text = quickPick.activeItems[0].label
          commands.executeCommand('i18n-ally.extract-text', options)
        }
        // else replace the marked string with i18n string
        else {
        // prompt for template
          const replacer = await promptTemplates(quickPick.activeItems[0].label, languageId)

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
        }
      })
      quickPick.onDidChangeValue(() => {
        const newItems: QuickPickItemWithType[] = [{ label: quickPick.value, description: i18n.t('prompt.new_key_with_value', quickPick.value), alwaysShow: true, type: 'new' }, ...quickPickItems]
        quickPick.items = newItems
      })
    })
}

export default m
