import { window } from 'vscode'
import { getExt, openFile, Global, is, not, setupTest, expect, KeyDetector, timeout } from '../../ctx'

setupTest('Vue i18n', () => {
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
    is(Global.enabledFrameworks.length, 2)
    is(Global.enabledFrameworks[0].id, 'vue')
    is(Global.enabledFrameworks[1].id, 'general')
  })

  it('get keys', async() => {
    await openFile('App.vue')
    await timeout(500)
    const keys = KeyDetector.getKeys(window.activeTextEditor!.document)
    expect(keys).to.matchSnapshot()
  })
})
