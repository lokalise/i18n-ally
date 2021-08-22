import { join } from 'path'
import { deepStrictEqual as is, notStrictEqual as not } from 'assert'
import { extensions, Uri, window, workspace } from 'vscode'
import Chai from 'chai'
// @ts-ignore
import Snapshot from 'chai-jest-snapshot'

Chai.use(Snapshot)

export const expect = Chai.expect
export { is, not }
export { Global, Config, Log, CurrentFile, KeyDetector, Commands } from '../../dist/extension'

export function timeout(ms = 1000) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function getExt() {
  return extensions.getExtension('lokalise.i18n-ally')!
}

export async function openFile(name: string) {
  const doc = await workspace.openTextDocument(Uri.file(join(workspace.workspaceFolders![0]!.uri.fsPath, name)))
  await window.showTextDocument(doc)
}

export function setupTest(name: string, fn: () => void) {
  describe(name, () => {
    before(() => {
      Snapshot.resetSnapshotRegistry()
    })

    beforeEach(function() {
      const { currentTest } = this
      Snapshot.setFilename(`${currentTest!.file!.replace('e2e-out', 'e2e')}.snap`)
      Snapshot.setTestName(currentTest!.fullTitle())
    })

    fn()
  })
}
