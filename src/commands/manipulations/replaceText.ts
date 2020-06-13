import { window } from 'vscode'

export async function ReplaceText(refactorTemplate: string) {
  const editor = window.activeTextEditor
  const document = editor?.document

  if (!editor || !document)
    return

  await editor.edit((editBuilder) => {
    editBuilder.replace(editor?.selection, refactorTemplate)
  })
}
