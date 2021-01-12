import { getExt, openFile, Global, is, not, setupTest } from '../../ctx'

setupTest('Vue i18n', () => {
  it('Navigate', async() => {
    await openFile('package.json')
  })

  it('Enabled', () => {
    const ext = getExt()
    is(ext?.isActive, true)
  })

  it('Global State', async() => {
    not(Global, undefined)
    is(Global.enabled, true)
    is(Global.enabledFrameworks.length, 1)
    is(Global.enabledFrameworks[0].id, 'vue')
  })
})
