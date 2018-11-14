'use strict'
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'

export function activate(ctx: vscode.ExtensionContext) {
  console.log('Vue-i18n is active')

  require('./hint').default(ctx)
}

export function deactivate() {}
