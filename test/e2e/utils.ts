import { resolve } from 'path'
import { VSBrowser, Workbench, InputBox, until, WebDriver, Locator, WebElement } from 'vscode-extension-tester'
import { NoSuchElementError } from 'selenium-webdriver/lib/error'

export function timeout(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function getContext() {
  const workbench = new Workbench()
  const browser = VSBrowser.instance
  const driver = browser.driver

  return { workbench, browser, driver }
}

export async function input(text: string) {
  const input = await InputBox.create()
  await input.setText(text)
  await input.confirm()
}

export async function gotoFile(path: string) {
  const workbench = new Workbench()
  await workbench.executeCommand('Go to file...')
  await input(path)
}

export async function pause() {
  return new Promise(() => {})
}

export async function openFixture(path: string) {
  const browser = VSBrowser.instance
  const driver = browser.driver

  const lastWorkbench = new Workbench()
  await lastWorkbench.executeCommand('workbench.action.files.openFileFolder')
  await input(`${resolve(__dirname, '../../', path)}/`)

  // wait for workbench to unload
  await driver.wait(until.stalenessOf(lastWorkbench))
  await browser.waitForWorkbench()

  const workbench = new Workbench()
  return { workbench, browser, driver }
}

export async function getElementPooling(driver: WebDriver, selector: Locator, timeout = 5_000) {
  const start = +new Date()
  let result: WebElement

  while (true) {
    if (+new Date() - start > timeout)
      throw new Error(`Timeout on querying ${JSON.stringify(selector)}`)
    try {
      result = await driver.findElement(selector)
    }
    catch (e) {
      if (!(e instanceof NoSuchElementError))
        throw e
    }
    if (result)
      break
  }

  return result
}
