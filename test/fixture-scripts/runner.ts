/* eslint-disable no-console */
import { join } from 'path'
import fs from 'fs'
import { commands, Uri, window, workspace } from 'vscode'

function timeout(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const entries = [
  'source.vue',
  'source.ts',
  'source.js',
  'source.tsx',
  'source.jsx',
]

export const run = async() => {
  const root = workspace.workspaceFolders![0]!.uri.fsPath
  const entry = entries.find(i => fs.existsSync(join(root, i)))
  if (!entry)
    process.exit(1)

  try {
    const doc = await workspace.openTextDocument(Uri.file(join(root, entry)))
    await window.showTextDocument(doc)
    await timeout(1000)

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
