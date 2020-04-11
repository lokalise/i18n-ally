import { window } from 'vscode'
import { LocaleTreeItem } from '../../views'
import { Config, CurrentFile } from '../../core'
import i18n from '../../i18n'
import { decorateLocale, Log } from '../../utils'
import { CommandOptions, getNodeOrRecord, getRecordFromNode } from './common'

export async function EditKey(item?: LocaleTreeItem | CommandOptions) {
  let node = getNodeOrRecord(item)

  if (!node)
    return

  if (node.type === 'node') {
    let locale = Config.displayLanguage
    if (item instanceof LocaleTreeItem && item.displayLocale)
      locale = item.displayLocale

    const record = await getRecordFromNode(node, locale)
    if (!record)
      return
    node = record
  }

  let placeholder = node.value

  if (Config.disablePathParsing && node.shadow && !node.value)
    placeholder = node.keypath

  try {
    const newvalue = await window.showInputBox({
      value: placeholder,
      prompt: i18n.t('prompt.edit_key_in_locale', node.keypath, decorateLocale(node.locale)),
    })

    if (newvalue !== undefined && newvalue !== node.value) {
      await CurrentFile.loader.write({
        value: newvalue,
        keypath: node.keypath,
        filepath: node.filepath,
        locale: node.locale,
        features: node.features,
      })
    }
  }
  catch (err) {
    Log.error(err.toString())
  }
}
