import * as vscode from 'vscode'

export function activate(ctx: vscode.ExtensionContext) {
  if (!vscode.workspace.workspaceFolders) return
  console.log('Vue-i18n is active')
  ;[require('./hint').default, require('./transCenter').default].forEach(
    module => module(ctx)
  )
}

export function deactivate() {}
