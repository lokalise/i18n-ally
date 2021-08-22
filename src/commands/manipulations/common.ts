import { window } from 'vscode'
import { LocaleTreeItem, ProgressSubmenuItem } from '~/views'
import { CurrentFile, Global, Node, LocaleNode, LocaleRecord, ActionSource } from '~/core'
import i18n from '~/i18n'

export interface CommandOptions {
  keypath: string
  locale?: string
  from?: string
  locales?: string[]
  keyIndex?: number
  actionSource?: ActionSource
}

export function getNodeOrRecord(item?: LocaleTreeItem | CommandOptions): LocaleNode | LocaleRecord | undefined {
  if (!item)
    return

  if (item instanceof LocaleTreeItem) {
    return item.node.type !== 'tree'
      ? item.node
      : undefined
  }

  if (item.locale)
    return CurrentFile.loader.getRecordByKey(item.keypath, item.locale, true)
  else
    return CurrentFile.loader.getNodeByKey(item.keypath, true)
}

export function getNode(item?: LocaleTreeItem | CommandOptions | ProgressSubmenuItem) {
  if (!item)
    return

  if (item instanceof ProgressSubmenuItem)
    return

  if (item instanceof LocaleTreeItem) {
    if (item.node.type === 'node')
      return item.node
    return
  }

  return CurrentFile.loader.getNodeByKey(item.keypath, true)
}

export async function getRecordFromNode(node: Node, defaultLocale?: string) {
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
