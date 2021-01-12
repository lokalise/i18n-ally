import { getExt, openFile, Global, is, not, setupTest } from '../../ctx'

setupTest('Laravel', () => {
  it('Navigate', async() => {
    await openFile('composer.json')
  })

  it('Enabled', () => {
    const ext = getExt()
    is(ext?.isActive, true)
  })

  it('Global State', async() => {
    not(Global, undefined)
    is(Global.enabled, true)
    is(Global.enabledFrameworks.length, 1)
    is(Global.enabledFrameworks[0].id, 'laravel')
  })
})
