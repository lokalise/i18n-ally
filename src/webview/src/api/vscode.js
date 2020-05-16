/* eslint-disable no-undef */

export function initVSCode() {
  const vscode = acquireVsCodeApi()

  console.info('VSCode Webview Mode')

  return {
    registerListener(fn) {
      window.addEventListener('message', e => fn(e.data))
    },
    postMessage: (...args) => {
      vscode.postMessage(...args)
    },
  }
}
