import { Common, LocaleLoader } from './core'
import { ExtensionContext, workspace, commands } from 'vscode'

export async function activate (ctx: ExtensionContext) {
  if (!workspace.workspaceFolders || !(await Common.isVueProject())) {
    console.log('vue-i18n is inactive')
    return
  }

  Common.loader = new LocaleLoader()
  await Common.loader.init()
  commands.executeCommand('setContext', 'vue-i18n-ally-enabled', true)

  console.log('Vue-i18n is active')
  ;[
    require('./commands').default,
    require('./editor').default,
    require('./views').default,
  ].forEach(module => ctx.subscriptions.push(module(ctx)))
}

export function deactivate () {}
