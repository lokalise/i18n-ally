import { window, commands } from 'vscode'
import { CurrentFile, Config, Commands } from '../../core'
import i18n from '../../i18n'
import { Log } from '../../utils'
import { overrideConfirm } from '../overrideConfirm'
import { keypathValidate } from '../keypathValidate'

export async function NewKey (keypath?: string) {
  try {
    keypath = await window.showInputBox({
      value: keypath || '',
      prompt: i18n.t('prompt.new_key_path'),
    })

    if (!keypath)
      return

    if (!keypathValidate(keypath))
      return window.showWarningMessage(i18n.t('prompt.invalid_keypath'))

    const shouldOverride = await overrideConfirm(keypath, false, true)

    if (shouldOverride === 'retry') {
      commands.executeCommand(Commands.new_key, keypath)
      return
    }

    if (shouldOverride !== 'override')
      return

    const locale = Config.sourceLanguage
    const value = await window.showInputBox({
      value: '',
      prompt: i18n.t('prompt.new_key_value', keypath, locale),
    })

    if (value === undefined)
      return

    await CurrentFile.loader.write({
      value,
      keypath,
      filepath: undefined,
      locale,
    })
  }
  catch (err) {
    Log.error(err.toString())
  }
}
