import { window } from 'vscode'
import { overrideConfirm } from '../overrideConfirm'
import { keypathValidate, Log, promptEdit } from '~/utils'
import i18n from '~/i18n'
import { CurrentFile, Config, Global, PendingWrite, Telemetry, TelemetryKey } from '~/core'

export async function NewKey(keypath?: string) {
  Telemetry.track(TelemetryKey.NewKey)

  try {
    keypath = await window.showInputBox({
      value: keypath || '',
      prompt: i18n.t('prompt.new_key_path'),
      ignoreFocusOut: true,
    })

    if (!keypath)
      return

    if (!keypathValidate(keypath)) {
      window.showWarningMessage(i18n.t('prompt.invalid_keypath'))
      await NewKey(keypath)
      return
    }

    keypath = CurrentFile.loader.rewriteKeys(keypath, 'write', { locale: Config.sourceLanguage })

    const shouldOverride = await overrideConfirm(keypath, false, true)

    if (shouldOverride === 'retry') {
      await NewKey(keypath)
      return
    }

    if (shouldOverride !== 'override')
      return

    const sourceLocale = Config.sourceLanguage
    const value = await promptEdit(keypath, sourceLocale, '')

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
    Log.error((err as Error).toString())
  }
}
