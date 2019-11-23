import { window } from 'vscode'
import { LocaleTreeItem } from '../../views'
import { CurrentFile, Global, Node } from '../../core'
import i18n from '../../i18n'

export interface CommandOptions {
  keypath: string
  locale: string
  from?: string
}

export function getNode (item?: LocaleTreeItem | CommandOptions) {
  if (!item)
    return

  if (item instanceof LocaleTreeItem)
    return item.node

  return CurrentFile.loader.getRecordByKey(item.keypath, item.locale, true)
}

export async function getRecordFromNode (node: Node, defaultLocale?: string) {
  if (node.type === 'tree')
    return

  if (node.type === 'record')
    return node

  if (node.type === 'node') {
    const locales = CurrentFile.loader.getShadowLocales(node)
    const locale = defaultLocale || await window.showQuickPick(
      Global.visibleLocales,
      { placeHolder: i18n.t('prompt.choice_locale') },
    )
    if (!locale)
      return
    return locales[locale]
  }
}
