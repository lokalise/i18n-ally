import * as vscode from 'vscode'

export interface ExtensionModule {
  (ctx: vscode.ExtensionContext): void
}
