export interface ProvideAPI {
  mode: 'devtools'|'vscode'
  server: {
    registerListener: (fn: Function) => void
    postMessage: (data?: any) => void
  }
  devtools?: {
    registerListener: (fn: Function) => void
    postMessage: (data?: any) => void
  }
}
