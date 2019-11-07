import { LocaleTreeView } from '../../views/LocalesTreeView'
import { Translator, CurrentFile, Config } from '../../core'
import { Log } from '../../utils'
import { getNode, CommandOptions } from './common'

export async function TranslateSingleKey (item?: LocaleTreeView | CommandOptions) {
  const node = getNode(item)
  const targetLocales = item instanceof LocaleTreeView ? item.listedLocales : undefined

  if (!node)
    return

  if (node.type === 'tree')
    return

  const from = (item && !(item instanceof LocaleTreeView) && item.from) || Config.sourceLanguage

  try {
    await Translator.MachineTranslate(CurrentFile.loader, node, from, targetLocales)
  }
  catch (err) {
    Log.error(err.toString())
  }
}

export async function TranslateKeys (item?: LocaleTreeView | CommandOptions) {
  return TranslateSingleKey(item)
}
