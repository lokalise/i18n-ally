import { resolve } from 'path'
import { VSBrowser, Workbench, InputBox, until } from 'vscode-extension-tester'

export function timeout(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function getContext() {
  const workbench = new Workbench()
  const browser = VSBrowser.instance
  const driver = browser.driver

  return { workbench, browser, driver }
}

export async function openFixture(path: string) {
  const browser = VSBrowser.instance
  const driver = browser.driver

  const lastWorkbench = new Workbench()
  await lastWorkbench.executeCommand('workbench.action.files.openFileFolder')
  const input = await InputBox.create()
  await input.setText(`${resolve(__dirname, '../../', path)}/`)
  await input.confirm()

  // wait for workbench to unload
  await driver.wait(until.stalenessOf(lastWorkbench))
  await browser.waitForWorkbench()

  const workbench = new Workbench()
  return { workbench, browser, driver }
}
