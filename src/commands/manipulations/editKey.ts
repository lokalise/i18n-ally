import { window } from 'vscode'
import { LocaleTreeView } from '../../views/LocalesTreeView'
import { Config, CurrentFile } from '../../core'
import i18n from '../../i18n'
import { decorateLocale, Log } from '../../utils'
import { CommandOptions, getNode, getRecordFromNode } from './common'

export async function EditKey (item?: LocaleTreeView | CommandOptions) {
  let node = getNode(item)

  if (!node)
    return

  if (node.type === 'tree')
    return

  if (node.type === 'node') {
    let locale = Config.displayLanguage
    if (item instanceof LocaleTreeView && item.displayLocale)
      locale = item.displayLocale

    const record = await getRecordFromNode(node, locale)
    if (!record)
      return
    node = record
  }

  try {
    const newvalue = await window.showInputBox({
      value: node.value,
      prompt: i18n.t('prompt.edit_key_in_locale', node.keypath, decorateLocale(node.locale)),
    })

    if (newvalue !== undefined && newvalue !== node.value) {
      await CurrentFile.loader.write({
        value: newvalue,
        keypath: node.keypath,
        filepath: node.filepath,
        locale: node.locale,
        sfc: node.sfc,
      })
    }
  }
  catch (err) {
    Log.error(err.toString())
  }
}
