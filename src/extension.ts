import { ExtensionContext, extensions, window } from 'vscode'
import { flatten } from 'lodash'
import { version } from '../package.json'
import { Global } from './core'
import commandsModules from './commands'
import editorModules from './editor'
import viewsModules from './views'
import { Log } from './utils'
import { CurrentFile } from './core/CurrentFile'
import { EXT_ID_I18N_ALLY, I18N_ALLY_URL } from './meta.js'
import i18n from './i18n.js'

export async function checkI18nAllyExists () {
  const extension = extensions.getExtension(EXT_ID_I18N_ALLY)
  if (extension) {
    Log.info(`🚧${i18n.t('prompt.disabled_due_to_new_version')}`)
    window.showWarningMessage(i18n.t('prompt.disabled_due_to_new_version'))
  }
  else {
    Log.info(`✨${i18n.t('prompt.i18n_ally_beta_avaliable')}`)
    Log.info(I18N_ALLY_URL)
  }
  return !!extension
}

export async function activate (ctx: ExtensionContext) {
  if (await checkI18nAllyExists())
    return

  Log.info(`🈶 Activated, v${version}`)

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

export function deactivate () {
  Log.info('🈚 Deactivated')
}
