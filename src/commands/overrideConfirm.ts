import { window } from 'vscode'
import { CurrentFile } from '~/core'
import i18n from '~/i18n'

export async function overrideConfirm(keypath: string, allowSkip = false, allowRenter = false) {
  const node = CurrentFile.loader.getTreeNodeByKey(keypath)

  if (node) {
    const Override = i18n.t('prompt.button_override')
    const Skip = i18n.t('prompt.button_skip')
    const Reenter = i18n.t('prompt.button_reenter')

    const options = [Override]

    if (allowSkip)
      options.push(Skip)

    if (allowRenter)
      options.push(Reenter)

    const result = await window.showInformationMessage(
      i18n.t('prompt.key_already_exists'),
      { modal: true },
      ...options,
    )

    if (result === Override)
      return 'override'

    if (result === Reenter)
      return 'retry'

    else if (result === Skip)
      return 'skip'

    return 'canceled'
  }

  return 'override'
}
