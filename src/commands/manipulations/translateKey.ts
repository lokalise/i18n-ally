import { window, ProgressLocation, CancellationToken, commands } from 'vscode'
import { LocaleTreeItem, ProgressSubmenuItem } from '../../views'
import { Translator, CurrentFile, Config, Global, LocaleNode, LocaleRecord, Commands } from '../../core'
import { Log } from '../../utils'
import i18n from '../../i18n'
import { getNodeOrRecord, CommandOptions, getNode } from './common'

export async function NotifyTranslated(node: LocaleNode | LocaleRecord, locales?: string[]) {
  const editBtn = i18n.t('prompt.translate_edit_translated')

  const locale = locales?.length === 1
    ? locales[0]
    : node.type === 'record'
      ? node.locale
      : undefined

  const result = await window.showInformationMessage(
    i18n.t('prompt.translate_missing_done_single', node.keypath),
    ...(locale ? [editBtn] : []),
  )

  if (result === editBtn)
    commands.executeCommand(Commands.edit_key, { keypath: node.keypath, locale })
}

export async function TranslateSingleKey(
  item?: LocaleTreeItem | CommandOptions,
  source?: string,
  prompt = true,
  token?: CancellationToken,
) {
  if (token?.isCancellationRequested)
    return

  const node = getNodeOrRecord(item)
  const targetLocales = item instanceof LocaleTreeItem ? item.listedLocales : undefined
  source = source || Config.sourceLanguage

  if (!node)
    return

  if (node.type === 'tree')
    return

  if (!prompt) {
    try {
      await Translator.MachineTranslate(CurrentFile.loader, node, source, targetLocales, token)
    }
    catch (err) {
      Log.error(err)
    }
  }
  else {
    window.withProgress({
      location: ProgressLocation.Notification,
      title: i18n.t('prompt.translate_in_progress'),
      cancellable: true,
    },
    async(progress, token) => {
      progress.report({ message: node.keypath })
      try {
        await Translator.MachineTranslate(CurrentFile.loader, node, source, targetLocales, token)
        progress.report({ increment: 100 })
        NotifyTranslated(node, targetLocales)
      }
      catch (err) {
        Log.error(err)
      }
    })
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
    window.withProgress({
      location: ProgressLocation.Notification,
      title: i18n.t('prompt.translate_in_progress'),
      cancellable: true,
    }, async(progress, token) => {
      const increment = 1 / keys.length * 100
      let count = 0

      for (const key of keys) {
        progress.report({ message: `${count + 1}/${keys.length} (${key})` })
        await TranslateSingleKey({ locale: to, keypath: key }, source, false, token)
        if (token.isCancellationRequested)
          break
        count += 1
        progress.report({ increment })
      }

      window.showInformationMessage(i18n.t('prompt.translate_missing_done', count))
    })
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
