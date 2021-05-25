/* eslint-disable no-console */
import { join } from 'path'
import { commands, Uri, window, workspace } from 'vscode'

function timeout(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const run = async() => {
  try {
    const doc = await workspace.openTextDocument(Uri.file(join(workspace.workspaceFolders![0]!.uri.fsPath, 'source.js')))
    await window.showTextDocument(doc)
    await timeout(500)

    await commands.executeCommand('i18n-ally.extract-hard-strings-batch')
    await doc.save()

    await timeout(500)
  }
  catch (e) {
    console.error(e)
    setTimeout(() => process.exit(1), 20)
    return
  }
  setTimeout(() => process.exit(0), 20)
}
