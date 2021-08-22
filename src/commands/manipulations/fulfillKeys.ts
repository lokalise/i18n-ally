import { window } from 'vscode'
import { CommandOptions } from './common'
import { ProgressSubmenuItem, LocaleTreeItem } from '~/views'
import { Global, PendingWrite, CurrentFile } from '~/core'
import i18n from '~/i18n'

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

export async function FulfillAllMissingKeys(prompt = true, extraKeys?: string[]) {
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
    const keys = loader.keys
    if (extraKeys?.length) {
      extraKeys.forEach((i) => {
        if (!keys.includes(i))
          keys.push(i)
      })
    }

    const cov = loader.getCoverage(locale, keys)
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
