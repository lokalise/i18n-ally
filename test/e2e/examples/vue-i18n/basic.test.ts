import { deepStrictEqual as is, notStrictEqual as not } from 'assert'
import { window } from 'vscode'
import { getExt, openFile, Global } from '../../ctx'

suite('Vue i18n', () => {
  window.showInformationMessage('Start all tests.')

  test('Navigate', async() => {
    await openFile('package.json')
  })

  test('Enabled', () => {
    const ext = getExt()
    is(ext?.isActive, true)
  })

  test('Global State', async() => {
    not(Global, undefined)
    is(Global.enabled, true)
    is(Global.enabledFrameworks.length, 1)
    is(Global.enabledFrameworks[0].id, 'vue')
  })
})
