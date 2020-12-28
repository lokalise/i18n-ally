// import the webdriver and the high level browser wrapper
import { resolve } from 'path'
import { expect } from 'chai'
import { VSBrowser, WebDriver, Workbench, InputBox, until } from 'vscode-extension-tester'

describe('sample', () => {
  let browser: VSBrowser
  let driver: WebDriver

  before(async() => {
    browser = VSBrowser.instance
    driver = browser.driver
  })

  it('welcome', async() => {
    const title = await driver.getTitle()
    expect(title.startsWith('Welcome')).to.eql(true)
  })

  it('open fixture', async() => {
    const workbench = new Workbench()
    await workbench.executeCommand('workbench.action.files.openFileFolder')
    await driver.sleep(100)
    const input = await InputBox.create()
    await input.setText(`${resolve(__dirname, '../../examples/by-frameworks/vue-i18n')}/`)
    await input.confirm()

    // wait for workbench to unload
    await driver.wait(until.stalenessOf(workbench))
    await browser.waitForWorkbench()

    const title = await driver.getTitle()
    expect(title).to.eql('Welcome — vue-i18n')
  })
    .timeout(60_000)
})
