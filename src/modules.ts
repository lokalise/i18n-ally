import { ExtensionContext, Disposable } from 'vscode'

export interface ExtensionModule {
  (ctx: ExtensionContext): Disposable | Disposable[]
}
