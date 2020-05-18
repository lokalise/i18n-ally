import { initDevtool } from './devtools'
import { initVSCode } from './vscode'
import { ProvideAPI } from './type'

export const api: ProvideAPI = (() => {
  try {
    return initVSCode()
  }
  catch {
    return initDevtool()
  }
})()
