import { window } from 'vscode'
import { promptKeys, promptTemplates } from '~/utils'
import i18n from '~/i18n'
import { Telemetry, TelemetryKey } from '~/core/Telemetry'

export async function InsertKey() {
  Telemetry.track(TelemetryKey.InsertKey)

  const editor = window.activeTextEditor
  const document = editor?.document

  if (!editor || !document)
    return

  const keypath = await promptKeys(i18n.t('prompt.choice_key_to_insert'))

  if (!keypath)
    return

  const replacer = await promptTemplates(keypath, [], document)

  if (!replacer)
    return

  // open editor if not exists
  await editor.edit((editBuilder) => {
    editBuilder.replace(editor?.selection, replacer)
  })
}
