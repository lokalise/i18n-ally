/* eslint-disable no-undef */

import { ProvideAPI } from './type'

export function initVSCode(): ProvideAPI {
  // @ts-ignore
  const vscode = acquireVsCodeApi()

  console.info('VS Code Webview Mode')

  return {
    mode: 'vscode',
    server: {
      registerListener(fn) {
        window.addEventListener('message', (e: any) => fn(e.data))
      },
      postMessage: (...args) => {
        console.log(args)
        vscode.postMessage(...args)
      },
    },
  }
}
