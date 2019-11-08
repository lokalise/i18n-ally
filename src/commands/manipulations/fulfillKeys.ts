import { window } from 'vscode'
import { ProgressSubmenuView } from '../../views/ProgressView'
import i18n from '../../i18n'
import { LocaleTreeView } from '../../views/LocalesTreeView'
import { Global } from '../../core/Global'
import { CommandOptions } from './common'

export async function FulfillMissingKeys (item: ProgressSubmenuView) {
  const Yes = i18n.t('prompt.button_yes')
  const locale = item.node.locale
  const keys = item.getKeys()
  const value = ''
  const result = await window.showWarningMessage(
    i18n.t('prompt.fullfill_missing_confirm', keys.length, locale),
    { modal: true },
    Yes,
  )
  if (result === Yes) {
    const pendings = keys.map(key => ({
      locale,
      value,
      filepath: Global.loader.getFilepathByKey(key, locale),
      keypath: key,
    }))
    await Global.loader.writeToFile(pendings) // TODO:sfc
  }
}

export async function FulfillKeys (item?: LocaleTreeView | ProgressSubmenuView | CommandOptions) {
  if (item instanceof ProgressSubmenuView)
    return FulfillMissingKeys(item)
  // TODO:
}
