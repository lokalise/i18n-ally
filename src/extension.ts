import * as vscode from 'vscode'
import Common from './core/Common'
import { LocaleLoader } from './core'

export async function activate (ctx: vscode.ExtensionContext) {
  if (!vscode.workspace.workspaceFolders || !(await Common.isVueProject())) {
    console.log('vue-i18n is inactive')
    return
  }

  Common.loader = new LocaleLoader()
  await Common.loader.init()
  console.log('Vue-i18n is active')
  ;[
    require('./commands/autoDetectLocales').default,
    require('./commands/extract').default,
    require('./commands/configLocalesGuide').default,
    require('./commands/configDisplayLanguage').default,
    require('./commands/debug').default,
    require('./editor/hint').default,
    require('./editor/completion').default,
    require('./legacy/fileTranslator').default,
    require('./editor/annotation').default,
    require('./view/LocalesTreeView').default,
    require('./view/ProgressView').default,
  ].forEach(module => ctx.subscriptions.push(module(ctx)))
}

export function deactivate () {}
