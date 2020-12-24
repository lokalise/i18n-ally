// import the webdriver and the high level browser wrapper
import { VSBrowser, WebDriver } from 'vscode-extension-tester'
import { expect } from 'chai'

// Create a Mocha suite
describe('sample', () => {
  let browser: VSBrowser
  let driver: WebDriver

  // initialize the browser and webdriver
  before(async() => {
    browser = VSBrowser.instance
    driver = browser.driver
  })

  // test whatever we want using webdriver, here we are just checking the page title
  it('sample 1', async() => {
    const title = await driver.getTitle()
    expect(title).to.be('whatever')
  })
})
