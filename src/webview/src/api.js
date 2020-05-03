/* eslint-disable no-undef */
export const api = (() => {
  try {
    return acquireVsCodeApi()
  }
  catch {
    return {
      postMessage(msg) {
        window.postMessage(JSON.stringify(msg))
      },
    }
  }
})()
