import { window } from 'vscode'
import { promptKeys, promptTemplates } from '../../utils'

export async function InsertKey() {
  const editor = window.activeTextEditor
  const document = editor?.document

  if (!editor || !document)
    return

  const keypath = await promptKeys()

  if (!keypath)
    return

  const replacer = await promptTemplates(keypath, document.languageId)

  if (!replacer)
    return

  // open editor if not exists
  await editor.edit((editBuilder) => {
    editBuilder.replace(editor?.selection, replacer)
  })
}
