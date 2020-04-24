import { window } from 'vscode'
import { ProgressSubmenuItem, LocaleTreeItem } from '../../views'
import { Global, PendingWrite, CurrentFile } from '../../core'
import i18n from '../../i18n'
import { CommandOptions } from './common'

const FULFILL_VALUE = ''

export async function FulfillMissingKeysForProgress(item: ProgressSubmenuItem) {
  const Yes = i18n.t('prompt.button_yes')
  const locale = item.node.locale
  const keys = item.getKeys()

  const result = await window.showWarningMessage(
    i18n.t('prompt.fullfill_missing_confirm', keys.length, locale),
    { modal: true },
    Yes,
  )
  if (result !== Yes)
    return

  const pendings = keys.map(key => ({
    locale,
    value: FULFILL_VALUE,
    filepath: CurrentFile.loader.getFilepathByKey(key, locale),
    keypath: key,
  }))

  return pendings
}

export async function FulfillAllMissingKeys(prompt = true) {
  if (prompt) {
    const Yes = i18n.t('prompt.button_yes')
    const result = await window.showWarningMessage(
      i18n.t('prompt.fullfill_missing_all_confirm'),
      { modal: true },
      Yes,
    )
    if (result !== Yes)
      return
  }

  let pendings: PendingWrite[] = []
  const loader = CurrentFile.loader
  for (const locale of Global.visibleLocales) {
    const cov = loader.getCoverage(locale)
    if (!cov)
      continue

    pendings = pendings.concat(cov.missingKeys.map(key => ({
      locale,
      value: FULFILL_VALUE,
      filepath: loader.getFilepathByKey(key, locale),
      keypath: key,
    })))
  }

  return pendings
}

export async function FulfillKeys(item?: LocaleTreeItem | ProgressSubmenuItem | CommandOptions) {
  let pendings: PendingWrite[] | undefined

  if (!item)
    pendings = await FulfillAllMissingKeys()

  if (item instanceof ProgressSubmenuItem)
    pendings = await FulfillMissingKeysForProgress(item)

  if (pendings?.length)
    await CurrentFile.loader.write(pendings, false)
}
