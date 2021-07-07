import { window } from 'vscode'
import { overrideConfirm } from '../overrideConfirm'
import { keypathValidate } from '../../utils/keypathValidate'
import { Log } from '~/utils'
import { LocaleTreeItem } from '~/views'
import i18n from '~/i18n'
import { Node, CurrentFile, PendingWrite } from '~/core'

export async function DuplicateKey(item?: LocaleTreeItem | string) {
  if (!item)
    return

  let node: Node | undefined

  if (typeof item === 'string')
    node = CurrentFile.loader.getTreeNodeByKey(item)
  else
    node = item.node

  if (!node || node.type !== 'node')
    return

  try {
    const oldkeypath = node.keypath
    const newkeypath = await window.showInputBox({
      value: oldkeypath,
      prompt: i18n.t('prompt.enter_new_keypath'),
      ignoreFocusOut: true,
    })

    if (!newkeypath)
      return

    if (!keypathValidate(newkeypath)) {
      window.showWarningMessage(i18n.t('prompt.invalid_keypath'))
      await DuplicateKey(item)
      return
    }

    if (await overrideConfirm(newkeypath) !== 'override')
      return

    const writes: PendingWrite[] = Object.values(node.locales)
      .map((v) => {
        return ({
          value: v.value,
          keypath: newkeypath,
          filepath: v.filepath,
          locale: v.locale,
        })
      })

    await CurrentFile.loader.write(writes)
  }
  catch (err) {
    Log.error(err)
  }
}
