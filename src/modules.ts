import { ExtensionContext } from 'vscode'

export interface ExtensionModule {
  (ctx: ExtensionContext): void
}
