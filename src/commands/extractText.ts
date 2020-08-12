import { commands, window, workspace, QuickPickItem } from 'vscode'
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
      let keypath = default_keypath

      const paths: Record<string, string> = {}

      // filter leafs from key tree
      CurrentFile.loader.keys.forEach((key) => {
        const lastIndex = key.lastIndexOf('.')
        let label = ''
        if (lastIndex === -1)
          label = key
        else
          label = key.substr(0, lastIndex)
        paths[label] = ''
      })

      // create quickPickItems out of the paths
      const quickPickItems: QuickPickItem[] = Object.keys(paths).map(path => ({ label: path }))

      // create and init a QuickPick for the path
      const pathPicker = window.createQuickPick()
      pathPicker.placeholder = i18n.t('prompt.select_or_create_a_path')
      pathPicker.ignoreFocusOut = true
      pathPicker.canSelectMany = false
      pathPicker.items = quickPickItems

      pathPicker.onDidAccept(() => {
        const selection = pathPicker.activeItems[0]
        pathPicker.hide()
        keypath = `${selection.label}.`
        keyPicker.prompt = i18n.t('prompt.enter_i18n_key_for_the_path', keypath)
        keyPicker.show()
      })

      // create new item if value not exists
      pathPicker.onDidChangeValue(() => {
        if (!Object.keys(paths).map(key => (key)).includes(pathPicker.value)) {
          const newItems = [{ label: pathPicker.value, description: i18n.t('prompt.create_new_path') }, ...quickPickItems]
          pathPicker.items = newItems
        }
      })

      pathPicker.onDidHide(() => pathPicker.dispose())

      await pathPicker.show()

      // create and init a InputBox for the key
      const keyPicker = window.createInputBox()
      keyPicker.ignoreFocusOut = true
      keyPicker.value = ''

      keyPicker.onDidAccept(async() => {
        keypath += keyPicker.value
        keyPicker.hide()
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
    })
}

export default m
