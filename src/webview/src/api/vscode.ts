/* eslint-disable no-undef */

import { ProvideAPI } from './type'

export function initVSCode(): ProvideAPI {
  // @ts-ignore
  const vscode = acquireVsCodeApi()

  console.info('VSCode Webview Mode')

  return {
    mode: 'vscode',
    server: {
      registerListener(fn) {
        window.addEventListener('message', (e: any) => fn(e.data))
      },
      postMessage: (...args) => {
        vscode.postMessage(...args)
      },
    },
  }
}
