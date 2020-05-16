
const RECONNECT_TIMEOUT = 5000

export function initDevtool() {
  console.info('Devtool Mode')

  let ws
  let _listener = () => {}
  let pendings = []
  let ready = false
  const insideIframe = window.parent && window.parent !== window

  const API = {

    registerListener(fn) {
      _listener = fn
    },

    postMessage(data) {
      if (data)
        pendings.push(data)
      if (ready && pendings.length) {
        for (const msg of pendings) {
          const payload = JSON.stringify(msg)

          // Send to ws
          ws.send(payload)

          // Also send to parent when inside of an iframe
          if (insideIframe)
            window.parent.postMessage(payload, '*')
        }
        pendings = []
      }
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
      _listener(JSON.parse(e.data))
    }

    ws.onopen = (e) => {
      console.log('i18n Ally Server connected')
      ready = true
      API.postMessage()
    }
  }

  if (insideIframe) {
    window.addEventListener('message', (e) => {
      _listener(e.data)
    })
  }

  initWs()

  return API
}
