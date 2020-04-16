import { ExtensionContext } from 'vscode'
import { flatten } from 'lodash'
import { version } from '../package.json'
import { Global } from './core'
import commandsModules from './commands'
import editorModules from './editor'
import viewsModules from './views'
import { Log } from './utils'
import { CurrentFile } from './core/CurrentFile'
import i18n from './i18n'

export async function activate(ctx: ExtensionContext) {
  Log.info(`🈶 Activated, v${version}`)

  i18n.init(ctx.extensionPath)

  // activate the extension
  await Global.init(ctx)
  CurrentFile.watch(ctx)

  const modules = [
    commandsModules,
    editorModules,
    viewsModules,
  ]

  const disposables = flatten(modules.map(m => m(ctx)))
  disposables.forEach(d => ctx.subscriptions.push(d))
}

export function deactivate() {
  Log.info('🈚 Deactivated')
}
