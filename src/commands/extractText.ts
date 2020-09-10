import * as path from 'path'
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

interface QuickPickItemWithKey extends QuickPickItem {
  keypath: string
  type: 'tree' | 'node' | 'new' | 'existed'
}

async function ExtractOrInsertCommnad(options?: ExtractTextOptions) {
  if (!options) {
    // execute from command palette, get from active document
    const editor = window.activeTextEditor
    const document = editor?.document
    if (!editor || !document)
      return
    options = {
      filepath: document.uri.fsPath,
      text: document.getText(editor.selection),
      range: editor.selection,
      languageId: document.languageId,
      isInsert: editor.selection.start.isEqual(editor.selection.end),
    }
  }

  const locale = Config.sourceLanguage
  const loader = CurrentFile.loader
  const { filepath, text, range, languageId, isInsert } = options
  const fileName = path.basename(filepath)
  const fileNameWithoutExt = path.basename(filepath, path.extname(filepath))
  const cleanedText = trim(text, '\'" ')
  let default_keypath: string
  const keygenStrategy = Config.keygenStrategy
  const keyPrefix = Config.keyPrefix
    .replace('{fileName}', fileName)
    .replace('{fileNameWithoutExt}', fileNameWithoutExt)

  const existingItems: QuickPickItemWithKey[]
    = isInsert
      ? []
      : loader.keys
        .map(key => ({
          description: loader.getValueByKey(key, Config.sourceLanguage, 0),
          keypath: key,
        }))
        .filter(item => item.description === cleanedText)
        .map(i => ({
          ...i,
          label: `$(replace-all) ${i.keypath}`,
          type: 'existed' as const,
          alwaysShow: true,
          detail: i18n.t('prompt.existing_translation'),
        }))

  if (keygenStrategy === 'random')
    default_keypath = nanoid()
  else if (keygenStrategy === 'empty')
    default_keypath = ''
  else
    default_keypath = limax(text, { separator: Config.preferredDelimiter, tone: false }) as string

  if (keyPrefix && keygenStrategy !== 'empty' && !isInsert)
    default_keypath = keyPrefix + default_keypath

  const getPickItems = (input?: string) => {
    const path = input?.split('.').slice(0, -1).join()

    const node = path
      ? (loader.getTreeNodeByKey(path))
      : CurrentFile.loader.root

    let items: QuickPickItemWithKey[] = []
    if (node?.type === 'tree') {
      items = Object
        .values(node.children)
        .sort((a, b) => b.type.localeCompare(a.type))
        .map(i => ({
          label: `$(${i.type === 'tree' ? 'json' : 'symbol-parameter'}) ${i.keypath}`,
          description: loader.getValueByKey(i.keypath),
          type: i.type,
          keypath: i.keypath,
        }))
    }
    else if (node?.type === 'node') {
      items = [
        {
          label: `$(symbol-parameter) ${node.keypath}`,
          description: loader.getValueByKey(node.keypath),
          type: node.type,
          keypath: node.keypath,
        },
      ]
    }

    if (existingItems.length)
      items = [...existingItems, ...items]

    // create new item if value not exists
    if (!isInsert && input && !input.endsWith('.') && !items.find(i => i.keypath === input)) {
      items.unshift({
        label: `$(add) ${input}`,
        description: i18n.t('prompt.create_new_path'),
        alwaysShow: true,
        keypath: input,
        type: 'new',
      })
    }

    return items
  }

  const extract = async(keypath: string, checkOverride = true) => {
    if (!keypath) {
      window.showWarningMessage(i18n.t('prompt.extraction_canceled'))
      return
    }
    if (!keypathValidate(keypath))
      return window.showWarningMessage(i18n.t('prompt.invalid_keypath'))

    const writeKeypath = CurrentFile.loader.rewriteKeys(keypath, 'write', { locale })

    let shouldOverride = 'skip'
    if (checkOverride) {
      shouldOverride = await overrideConfirm(writeKeypath, true, true)
      if (shouldOverride === 'retry') {
        commands.executeCommand(Commands.extract_text, options)
        return
      }
      if (shouldOverride === 'canceled')
        return
    }

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
      value: cleanedText,
      locale,
    })
  }

  // create and init a QuickPick for the path
  const picker = window.createQuickPick<QuickPickItemWithKey>()
  picker.placeholder = i18n.t('prompt.enter_key_path', cleanedText)
  picker.ignoreFocusOut = true
  picker.canSelectMany = false
  picker.value = default_keypath
  picker.items = getPickItems(default_keypath)
  picker.matchOnDescription = true

  picker.onDidAccept(() => {
    const selection = picker.activeItems[0]
    if (!selection)
      return

    if (selection.type === 'new' || selection.type === 'node') {
      picker.dispose()
      extract(selection.keypath, !isInsert)
    }
    if (selection.type === 'existed') {
      picker.dispose()
      extract(selection.keypath, false)
    }
    else {
      const value = `${selection.keypath}.`
      picker.value = value
      picker.items = getPickItems(value)
      picker.show()
    }
  })

  picker.onDidChangeValue(() => {
    picker.items = getPickItems(picker.value)
  })

  picker.onDidHide(() => picker.dispose())

  await picker.show()
}

const m: ExtensionModule = () => {
  return [
    commands.registerCommand(Commands.extract_text, ExtractOrInsertCommnad),
  ]
}

export default m
