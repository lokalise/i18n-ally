import { window } from 'vscode'
import { CurrentFile, Config, Global, PendingWrite } from '../../core'
import i18n from '../../i18n'
import { Log } from '../../utils'
import { overrideConfirm } from '../overrideConfirm'
import { keypathValidate } from '../keypathValidate'

export async function NewKey(keypath?: string) {
  try {
    keypath = await window.showInputBox({
      value: keypath || '',
      prompt: i18n.t('prompt.new_key_path'),
    })

    if (!keypath)
      return

    if (!keypathValidate(keypath)) {
      window.showWarningMessage(i18n.t('prompt.invalid_keypath'))
      await NewKey(keypath)
    }

    const shouldOverride = await overrideConfirm(keypath, false, true)

    if (shouldOverride === 'retry') {
      await NewKey(keypath)
      return
    }

    if (shouldOverride !== 'override')
      return

    const sourceLocale = Config.sourceLanguage
    const value = await window.showInputBox({
      value: '',
      prompt: i18n.t('prompt.new_key_value', keypath, sourceLocale),
    })

    if (value === undefined)
      return

    if (Config.keepFulfilled) {
      await CurrentFile.loader.write(
        Global.allLocales.map(locale => ({
          value: sourceLocale === locale ? value : '',
          keypath,
          filepath: undefined,
          locale,
        } as PendingWrite)),
        false,
      )
    }
    else {
      await CurrentFile.loader.write({
        value,
        keypath,
        filepath: undefined,
        locale: sourceLocale,
      })
    }
  }
  catch (err) {
    Log.error(err.toString())
  }
}
