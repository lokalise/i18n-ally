import { window } from 'vscode'
import { getExt, openFile, Global, is, not, setupTest, timeout, KeyDetector, expect } from '../../ctx'

setupTest('Ruby on Rails', () => {
  it('opens entry file', async() => {
    await openFile('Gemfile')
  })

  it('is active', () => {
    const ext = getExt()
    is(ext?.isActive, true)
  })

  it('enables correct frameworks', async() => {
    not(Global, undefined)
    is(Global.enabled, true)
    is(Global.enabledFrameworks.length, 1)
    is(Global.enabledFrameworks[0].id, 'ruby-rails')
  })

  it('get keys', async() => {
    await openFile('app/views/pages/index.html.erb')
    await timeout(500)
    const keys = KeyDetector.getKeys(window.activeTextEditor!.document)
    expect(keys).to.matchSnapshot()
  })
})
