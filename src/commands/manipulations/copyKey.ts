import { window, env } from 'vscode'
import { LocaleTreeItem } from '~/views'
import i18n from '~/i18n'

export async function CopyKey({ node }: LocaleTreeItem) {
  await env.clipboard.writeText(node.keypath)
  window.showInformationMessage(i18n.t('prompt.key_copied'))
}
