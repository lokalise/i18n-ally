import { ExtensionContext, workspace, commands } from 'vscode'
import { flatten } from 'lodash'
import { Global, LocaleLoader } from './core'
import commandsModules from './commands'
import editorModules from './editor'
import viewsModules from './views'

export async function activate (ctx: ExtensionContext) {
  // Deactivate for non vue-i18n enabled project
  if (!workspace.workspaceFolders || !(await Global.isVueProject()))
    return

  // activate the extension
  Global.loader = new LocaleLoader()
  await Global.loader.init()
  commands.executeCommand('setContext', 'vue-i18n-ally-enabled', true)

  const modules = [
    commandsModules,
    editorModules,
    viewsModules,
  ]
  const disposables = flatten(modules.map(m => m(ctx)))
  disposables.forEach(d => ctx.subscriptions.push(d))
}

export function deactivate () {}
