import { window } from 'vscode'
import { LocaleTreeItem, ProgressSubmenuItem } from '../../views'
import { Translator, CurrentFile, Config, Global, LocaleNode } from '../../core'
import { Log } from '../../utils'
import i18n from '../../i18n'
import { getNodeOrRecord, CommandOptions, getNode } from './common'

export async function TranslateSingleKey(item?: LocaleTreeItem | CommandOptions, source?: string) {
  const node = getNodeOrRecord(item)
  const targetLocales = item instanceof LocaleTreeItem ? item.listedLocales : undefined
  source = source || Config.sourceLanguage

  if (!node)
    return

  if (node.type === 'tree')
    return

  try {
    await Translator.MachineTranslate(CurrentFile.loader, node, source, targetLocales)
  }
  catch (err) {
    Log.error(err.toString())
  }
}

export async function TranslateMultipleKeys(item: ProgressSubmenuItem, source: string) {
  const Yes = i18n.t('prompt.button_yes')
  const to = item.node.locale
  source = source || Config.sourceLanguage

  const keys = item.getKeys()
  const result = await window.showWarningMessage(
    i18n.t('prompt.translate_missing_confirm', keys.length, to, source),
    { modal: true },
    Yes,
  )
  if (result === Yes) {
    window.showInformationMessage(i18n.t('prompt.translate_missing_in_progress'))
    for (const key of keys)
      await TranslateSingleKey({ locale: to, keypath: key }, source)
    window.showInformationMessage(i18n.t('prompt.translate_missing_done', keys.length))
  }
}

export async function promptForSourceLocale(defaultLocale: string, node?: LocaleNode, to?: string) {
  const locales = Global.allLocales
  const placeHolder = i18n.t('prompt.select_source_language_for_translating', defaultLocale)

  const result = await window.showQuickPick(locales
    .map(locale => ({
      label: locale,
      description: node?.getValue(locale),
    })), {
    placeHolder,
  })

  if (result == null)
    return undefined

  return result.label || defaultLocale
}

export async function TranslateKeys(item?: LocaleTreeItem | ProgressSubmenuItem | CommandOptions) {
  let source: string | undefined

  if (item && !(item instanceof LocaleTreeItem) && !(item instanceof ProgressSubmenuItem) && item.from) {
    source = item.from
  }
  else {
    const node = getNode(item)

    source = Config.sourceLanguage
    if (Config.promptTranslatingSource)
      source = await promptForSourceLocale(source, node)

    if (source == null)
      return
  }

  if (item instanceof ProgressSubmenuItem)
    return TranslateMultipleKeys(item, source)
  else
    return TranslateSingleKey(item, source)
}
