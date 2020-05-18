import { ProvideAPI } from './type'

const RECONNECT_TIMEOUT = 5000

export function initDevtool() {
  console.info('Devtool Mode')

  let ws: WebSocket
  let _serverListener: Function = () => {}
  let _clientListener: Function = () => {}
  let _serverPendings: any[] = []
  let _clientPendings: any[] = []
  let _serverReady = false
  let _clientReady = false

  const API: ProvideAPI = {
    mode: 'devtools',

    server: {
      registerListener(fn: Function) {
        _serverListener = fn
      },
      postMessage(data) {
        if (data)
          _serverPendings.push(data)
        if (_serverReady && _serverPendings.length) {
          for (const msg of _serverPendings) {
            const payload = JSON.stringify(msg)

            // Send to ws
            ws.send(payload)
          }
          _serverPendings = []
        }
      },
    },
    client: {
      registerListener(fn: Function) {
        _clientListener = fn
      },
      postMessage(data) {
        if (data)
          _clientPendings.push(data)
        if (_clientReady && _clientPendings.length) {
          for (const msg of _clientPendings) {
            const payload = JSON.stringify(msg)
            window.parent.postMessage(payload, '*')
            _clientPendings = []
          }
        }
      },
    },
  }

  function initWs() {
    ws = new WebSocket('ws://localhost:1897')

    ws.onclose = () => {
      setTimeout(() => {
        console.log('Reconnecting i18n Ally Server')
        initWs()
      }, RECONNECT_TIMEOUT)
    }

    ws.onmessage = (e) => {
      _serverListener(JSON.parse(e.data))
    }

    ws.onopen = (e) => {
      console.log('i18n Ally Server connected')
      _serverReady = true
      API.server.postMessage(undefined)
    }
  }

  function initTheme() {
    const theme = {
      foreground: 'white',
      'editor-foreground': 'white',
      background: '#222',
      'font-size': '14px',
      'editor-background': '#222',
      'font-family': '-apple-system, BlinkMacSystemFont, "Segoe WPC", "Segoe UI", "Ubuntu", "Droid Sans", sans-serif',
      'editor-font-family': 'monospace',
    }
    const css = []
    for (const key of Object.keys(theme))
      css.push(`--vscode-${key}:${theme[key]}`)

    const style = document.createElement('style')
    style.innerHTML = `:root{${css.join(';')}}`
    document.head.appendChild(style)
  }

  initTheme()

  window.addEventListener('message', (e) => {
    switch (e.data.type) {
      case 'ready':
        _clientReady = true
        return
      case 'close':
        _clientReady = false
        return
    }
    _clientListener(e.data)
  })

  initWs()

  return API
}
