export interface ProvideAPI {
  mode: 'devtools'|'vscode'
  server: {
    registerListener: (fn: Function) => void
    postMessage: (data: any) => void
  }
  client?: {
    registerListener: (fn: Function) => void
    postMessage: (data: any) => void
  }
}
