import * as vscode from 'vscode'
import Common from './utils/Common'

export async function activate (ctx: vscode.ExtensionContext) {
  if (!vscode.workspace.workspaceFolders || !(await Common.isVueProject())) {
    console.log('vue-i18n is inactive')
    return
  }

  console.log('Vue-i18n is active')
  ;[
    require('./commands/autoDetectLocales').default,
    require('./commands/extract').default,
    require('./commands/configLocalesGuide').default,
    require('./commands/configDisplayLanguage').default,
    require('./commands/debug').default,
    require('./hint').default,
    require('./completion').default,
    require('./fileTranslator').default,
    require('./annotation').default,
    require('./view/LocalesTree').default,
  ].forEach(module => ctx.subscriptions.push(module(ctx)))
}

export function deactivate () {}
