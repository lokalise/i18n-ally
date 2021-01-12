import { openFile, Global, is, not, expect, timeout, setupTest, getExt } from '../../ctx'

setupTest('React with i18next', () => {
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
    is(Global.enabledFrameworks[0].id, 'react')
    is(Global.enabledFrameworks[1].id, 'i18next')
  })

  it('get correct coverage report', async() => {
    await timeout(500)
    not(Global, undefined)
    not(Global.loader, undefined)
    expect(Global.loader.getCoverage('en')).to.matchSnapshot()
  })
})
