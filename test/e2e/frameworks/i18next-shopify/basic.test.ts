import { window } from 'vscode'
import { openFile, Global, is, not, expect, timeout, setupTest, getExt, KeyDetector } from '../../ctx'

setupTest('Shopify React i18next', () => {
  it('opens entry file', async() => {
    await openFile('package.json')
  })

  it('is active', () => {
    const ext = getExt()
    is(ext?.isActive, true)
  })

  it('enables correct frameworks', async() => {
    not(Global, undefined)
    is(Global.enabled, true)
    is(Global.enabledFrameworks.length, 1)
    is(Global.enabledFrameworks[0].id, 'i18next-shopify')
  })

  it('get correct coverage report', async() => {
    await timeout(500)
    not(Global, undefined)
    not(Global.loader, undefined)
    const coverage = Global.loader.getCoverage('en')
    expect(coverage).to.matchSnapshot()
  })

  it('get keys', async() => {
    await openFile('src/App.jsx')
    await timeout(500)
    const keys = KeyDetector.getKeys(window.activeTextEditor!.document)
    expect(keys).to.matchSnapshot()
  })
})
