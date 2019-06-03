import { Common, LocaleLoader } from './core'
import { ExtensionContext, workspace } from 'vscode'

export async function activate (ctx: ExtensionContext) {
  if (!workspace.workspaceFolders || !(await Common.isVueProject())) {
    console.log('vue-i18n is inactive')
    return
  }

  Common.loader = new LocaleLoader()
  await Common.loader.init()
  console.log('Vue-i18n is active')
  ;[
    require('./commands').default,
    require('./editor').default,
    require('./views').default,
    require('./legacy/fileTranslator').default,
  ].forEach(module => ctx.subscriptions.push(module(ctx)))
}

export function deactivate () {}
