import * as vscode from 'vscode'

export function activate(ctx: vscode.ExtensionContext) {
  console.log('Vue-i18n is active')

  require('./hint').default(ctx)
  require('./transCenter').default(ctx)
}

export function deactivate() {}
