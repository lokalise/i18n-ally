/* eslint-disable import/no-mutable-exports */
/* eslint-disable no-undef */

import { initDevtool } from './devtool'
import { initVSCode } from './vscode'

export let mode = 'webview'

export const api = (() => {
  try {
    return initVSCode()
  }
  catch {
    mode = 'devtool'
    return initDevtool()
  }
})()
