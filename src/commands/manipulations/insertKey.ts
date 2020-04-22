import { window } from 'vscode'
import i18n from '../../i18n'
import { CurrentFile, Global, Config } from '../../core'

export async function InsertKey() {
  const editor = window.activeTextEditor
  const document = editor?.document

  if (!editor || !document)
    return

  const display = Config.displayLanguage

  const keypath = await window.showQuickPick(CurrentFile.loader.keys.map(key => ({
    label: key,
    description: CurrentFile.loader.getValueByKey(key, display, 30),
  })), {
    matchOnDescription: true,
    placeHolder: i18n.t('prompt.choice_key_to_insert'),
  })

  if (!keypath)
    return

  const replacer = await window.showQuickPick(
    Global.refactorTemplates(keypath.label, document.languageId),
    {
      placeHolder: i18n.t('prompt.replace_text_as'),
    })

  if (!replacer)
    return

  // open editor if not exists
  await editor.edit((editBuilder) => {
    editBuilder.replace(editor?.selection, replacer)
  })
}
