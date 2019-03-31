import * as vscode from 'vscode'

export async function activate(ctx: vscode.ExtensionContext) {
  if (!vscode.workspace.workspaceFolders) {
    return
  }

  console.log('Vue-i18n is active');
  [
    require('./guide').default,
    require('./hint').default,
    require('./extract').default,
    require('./completion').default,
    require('./transCenter').default
  ].forEach(module => ctx.subscriptions.push(module(ctx)))
}

export function deactivate() {}
