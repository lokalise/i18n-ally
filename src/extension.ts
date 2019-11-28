import { ExtensionContext, extensions, window, commands } from 'vscode'
import { flatten } from 'lodash'
import { version } from '../package.json'
import { Global } from './core'
import commandsModules from './commands'
import editorModules from './editor'
import viewsModules from './views'
import { Log } from './utils'
import { CurrentFile } from './core/CurrentFile'
import { EXT_ID_I18N_ALLY, I18N_ALLY_URL, EXT_ID } from './meta'
import i18n from './i18n'

export async function installI18nAlly () {
  await commands.executeCommand(
    'workbench.extensions.installExtension',
    EXT_ID_I18N_ALLY,
  )
}

export async function uninstallSelf () {
  console.log('uninstall')
  try {
    await commands.executeCommand(
      'workbench.extensions.uninstallExtension',
      EXT_ID,
    )
  }
  catch (e) {
    Log.error(e)
  }
}

export async function reloadWindow () {
  commands.executeCommand('workbench.action.reloadWindow')
}

export async function migration () {
  await installI18nAlly()
  await uninstallSelf()
}

export async function promptMigration (ctx: ExtensionContext) {
  if (!ctx.globalState.get('ignore_update')) {
    const update = i18n.t('prompt.update')
    const ignore = i18n.t('prompt.never_mind')
    const result = await window.showInformationMessage(
      `✨${i18n.t('prompt.i18n_ally_avaliable')}`,
      update,
      ignore,
    )
    if (result === ignore)
      ctx.globalState.update('ignore_update', true)
    if (result === update) {
      await migration()
      const reload = i18n.t('prompt.reload')
      const reloadResult = await window.showInformationMessage(
        i18n.t('prompt.migration_finished'),
        reload,
      )
      if (reloadResult === reload)
        reloadWindow()
    }
  }
}

export async function checkI18nAllyExists (ctx: ExtensionContext) {
  const extension = extensions.getExtension(EXT_ID_I18N_ALLY)
  if (extension) {
    Log.info(`🚧${i18n.t('prompt.disabled_due_to_new_version')}`)
    window.showWarningMessage(i18n.t('prompt.disabled_due_to_new_version'))
    await uninstallSelf()
  }
  else {
    const text = `✨${i18n.t('prompt.i18n_ally_avaliable')}`
    Log.info(text)
    Log.info(I18N_ALLY_URL)
    promptMigration(ctx)
  }
  return !!extension
}

export async function activate (ctx: ExtensionContext) {
  if (await checkI18nAllyExists(ctx))
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
