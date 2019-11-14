import { MarkdownString } from 'vscode'
import { CurrentFile, Global, Commands } from '../core'
import { decorateLocale, escapeMarkdown, NodeHelper, GlyphChars } from '../utils'
import i18n from '../i18n'

function makeMarkdownCommand (command: Commands, args: object): string {
  return `command:${command}?${encodeURIComponent(JSON.stringify(args))}`
}

function formatValue (text: string) {
  return escapeMarkdown(text.replace('\n', ' '))
}

export function createHover (keypath: string, maxLength = 0) {
  const loader = CurrentFile.loader
  const locales = loader.getTranslationsByKey(keypath)

  const transTable = Global.visibleLocales
    .map((locale) => {
      const commands = []
      const row = {
        locale: decorateLocale(locale),
        value: formatValue(loader.getValueByKey(keypath, locale, maxLength) || '-'),
        commands: '',
      }
      const record = locales[locale]
      if (record) {
        if (NodeHelper.isTranslatable(record)) {
          commands.push({
            text: i18n.t('command.translate_key'),
            icon: GlyphChars.Translate,
            command: makeMarkdownCommand(Commands.translate_key, { keypath, locale }),
          })
        }
        if (NodeHelper.isEditable(record)) {
          commands.push({
            text: i18n.t('command.edit_key'),
            icon: GlyphChars.Pencil,
            command: makeMarkdownCommand(Commands.edit_key, { keypath, locale }),
          })
        }
        if (NodeHelper.isOpenable(record)) {
          commands.push({
            text: i18n.t('command.open_key'),
            icon: GlyphChars.ArrowUpRight,
            command: makeMarkdownCommand(Commands.open_key, { keypath, locale }),
          })
        }
      }
      row.commands = commands.map(c => `[${c.icon}](${c.command} "${c.text}")`).join(' ')
      return row
    })
    .map(item => `| | **${item.locale}** | | ${item.value} | ${item.commands} |`)
    .join('\n')

  if (!transTable)
    return

  const markdown = `| | | | | |\n|---|---:|---|---|---:|\n${transTable}\n| | | | | |`

  const markdownText = new MarkdownString(markdown)
  markdownText.isTrusted = true

  return markdownText
}
