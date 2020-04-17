import { window } from 'vscode'
import { LocaleTreeItem } from '../../views'
import { Node, CurrentFile, PendingWrite } from '../../core'
import i18n from '../../i18n'
import { Log } from '../../utils'
import { overrideConfirm } from '../overrideConfirm'
import { keypathValidate } from '../keypathValidate'

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
