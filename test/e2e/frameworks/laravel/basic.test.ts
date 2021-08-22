import { getExt, openFile, Global, is, not, setupTest } from '../../ctx'

setupTest('Laravel', () => {
  it('opens entry file', async() => {
    await openFile('composer.json')
  })

  it('is active', () => {
    const ext = getExt()
    is(ext?.isActive, true)
  })

  it('enables correct frameworks', async() => {
    not(Global, undefined)
    is(Global.enabled, true)
    is(Global.enabledFrameworks.length, 1)
    is(Global.enabledFrameworks[0].id, 'laravel')
  })
})
