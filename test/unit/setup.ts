import { basename, dirname, join } from 'path'
import * as Chai from 'chai'
// @ts-ignore
import Snapshot from 'chai-jest-snapshot'

before(() => {
  Chai.use(Snapshot)
  Snapshot.resetSnapshotRegistry()
})

beforeEach(function() {
  const { currentTest } = this
  const file = currentTest!.file!
  const path = join(dirname(file), '__snapshots__', `${basename(file)}.snap`)
  Snapshot.setFilename(path)
  Snapshot.setTestName(currentTest!.fullTitle())
})
