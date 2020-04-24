import { LocaleTreeItem } from '../../views'
import { Config, CurrentFile } from '../../core'
import { Log } from '../../utils'
import { promptEdit } from '../../utils/prompts'
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

  let value = node.value

  if (Config.disablePathParsing && node.shadow && !node.value)
    value = node.keypath

  try {
    const newvalue = await promptEdit(node.keypath, node.locale, value)

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
