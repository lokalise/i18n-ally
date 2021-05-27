import { getExt, openFile, Global, is, not, setupTest } from '../../ctx'

setupTest('Vue i18n SFC', () => {
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
    is(Global.enabledFrameworks.length, 3)
    is(Global.enabledFrameworks[0].id, 'vue')
    is(Global.enabledFrameworks[1].id, 'general')
    is(Global.enabledFrameworks[2].id, 'vue-sfc')
  })

  // TODO: install Vetur to correctly infer the language ID
})
