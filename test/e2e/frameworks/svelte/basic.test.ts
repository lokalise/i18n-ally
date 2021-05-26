import { getExt, openFile, Global, is, not, setupTest } from '../../ctx'

setupTest('Svelte', () => {
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
    is(Global.enabledFrameworks[0].id, 'svelte')
    is(Global.enabledFrameworks[1].id, 'general')
  })
})
