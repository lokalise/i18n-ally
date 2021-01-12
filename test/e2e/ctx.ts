import { join } from 'path'
import { extensions, Uri, window, workspace } from 'vscode'

export { Global, Config, Log, CurrentFile } from '../../dist/extension'

export function timeout(ms = 1000) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function getExt() {
  return extensions.getExtension('antfu.i18n-ally')!
}

export async function openFile(name: string) {
  const doc = await workspace.openTextDocument(Uri.file(join(workspace.workspaceFolders![0]!.uri.fsPath, name)))
  await window.showTextDocument(doc)
}
