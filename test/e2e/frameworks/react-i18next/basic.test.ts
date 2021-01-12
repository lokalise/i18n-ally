import { getExt, openFile, Global, is, not, expect, timeout, setupTest } from '../../ctx'

setupTest('React i18next', () => {
  it('Navigate', async() => {
    await openFile('package.json')
  })

  it('Enabled', () => {
    const ext = getExt()
    is(ext?.isActive, true)
    ext.activate()
  })

  it('Global State', async() => {
    not(Global, undefined)
    is(Global.enabled, true)
    is(Global.enabledFrameworks.length, 2)
    is(Global.enabledFrameworks[0].id, 'react')
    is(Global.enabledFrameworks[1].id, 'i18next')
  })

  it('getCoverage', async() => {
    await timeout(1000)
    not(Global, undefined)
    not(Global.loader, undefined)
    // @ts-ignore
    expect(Global.loader.getCoverage('en')).to.matchSnapshot()
  })
})
