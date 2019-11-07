import { window } from 'vscode'
import { LocaleTreeView } from '../../views/LocalesTreeView'
import { Translator, CurrentFile, Config } from '../../core'
import { Log } from '../../utils'
import { ProgressMissingListView } from '../../views/ProgressView'
import i18n from '../../i18n'
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

export async function TranslateMultipleKeys (item: ProgressMissingListView) {
  const Yes = i18n.t('prompt.button_yes')
  const to = item.node.locale
  const from = Config.sourceLanguage
  const keys = item.getKeys()
  const result = await window.showWarningMessage(
    i18n.t('prompt.translate_missing_confirm', keys.length, to, from),
    { modal: true },
    Yes,
  )
  if (result === Yes) {
    window.showInformationMessage(i18n.t('prompt.translate_missing_in_progress'))
    for (const key of keys)
      await TranslateSingleKey({ locale: to, keypath: key })
    window.showInformationMessage(i18n.t('prompt.translate_missing_done', keys.length))
  }
}

export async function TranslateKeys (item?: LocaleTreeView | ProgressMissingListView | CommandOptions) {
  if (item instanceof ProgressMissingListView)
    return TranslateMultipleKeys(item)
  else
    return TranslateSingleKey(item)
}
