/* eslint-disable no-console */
import { join } from 'path'
import { commands, Uri, window, workspace } from 'vscode'
import { Commands } from '../../dist/extension'

function timeout(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const run = async() => {
  try {
    const doc = await workspace.openTextDocument(Uri.file(join(workspace.workspaceFolders![0]!.uri.fsPath, 'source.js')))
    await window.showTextDocument(doc)
    await timeout(2000)

    await commands.executeCommand(Commands.extract_hard_strings_batch)
    // console.log(strings)

    await timeout(1000)
  }
  catch (e) {
    console.error(e)
    process.exit(1)
  }
  process.exit(0)
}
