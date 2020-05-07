/* eslint-disable import/no-mutable-exports */
/* eslint-disable no-undef */

export let mode = 'webview'

export const api = (() => {
  try {
    const vscode = acquireVsCodeApi()
    console.info('Webview Mode')
    return {
      registerListener(fn) {
        window.addEventListener('message', e => fn(e.data))
      },
      postMessage: (...args) => {
        vscode.postMessage(...args)
      },
    }
  }
  catch {
    mode = 'devtool'
    console.info('Devtool Mode')

    const ws = new WebSocket('ws://localhost:1897')
    let _listener = () => {}
    let pendings = []
    let ready = false

    const API = {
      registerListener(fn) {
        _listener = fn
      },
      postMessage(data) {
        if (data)
          pendings.push(data)
        if (ready && pendings.length) {
          for (const msg of pendings)
            ws.send(JSON.stringify(msg))
          pendings = []
        }
      },
    }

    ws.onmessage = (e) => {
      _listener(JSON.parse(e.data))
    }
    ws.onopen = (e) => {
      ready = true
      API.postMessage()
    }
    return API
  }
})()
