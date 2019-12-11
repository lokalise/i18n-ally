import { MarkdownString } from 'vscode'
import { CurrentFile, Global, Commands, LocaleRecord, Config } from '../core'
import { decorateLocale, escapeMarkdown, NodeHelper } from '../utils'
import i18n from '../i18n'

const EmptyButton = '⠀⠀'

function makeMarkdownCommand (command: Commands, args: object): string {
  return `command:${command}?${encodeURIComponent(JSON.stringify(args))}`
}

function formatValue (text: string) {
  return escapeMarkdown(text.replace(/\n/g, ' '))
}

function getAvaliableCommands (record?: LocaleRecord) {
  const commands = []

  if (record) {
    const { keypath, locale } = record

    if (NodeHelper.isTranslatable(record)) {
      commands.push({
        text: i18n.t('command.translate_key'),
        icon: '🌍',
        command: makeMarkdownCommand(Commands.translate_key, { keypath, locale }),
      })
    }
    else {
      commands.push(EmptyButton)
    }
    if (NodeHelper.isEditable(record)) {
      commands.push({
        text: i18n.t('command.edit_key'),
        icon: '📝',
        command: makeMarkdownCommand(Commands.edit_key, { keypath, locale }),
      })
    }
    else {
      commands.push(EmptyButton)
    }
    if (NodeHelper.isOpenable(record)) {
      commands.push({
        text: i18n.t('command.open_key'),
        icon: '💬',
        command: makeMarkdownCommand(Commands.open_key, { keypath, locale }),
      })
    }
    else {
      commands.push(EmptyButton)
    }
  }

  return commands
}

export function createTable (visibleLocales: string[], records: Record<string, LocaleRecord>, maxLength = 0) {
  const transTable = visibleLocales
    .map((locale) => {
      const record = records[locale]
      const row = {
        locale: decorateLocale(locale),
        value: formatValue(CurrentFile.loader.getValueByKey(record.keypath, locale, maxLength) || '-'),
        commands: '',
      }
      const commands = getAvaliableCommands(record)
      row.commands = commands
        .map(c => typeof c === 'string' ? c : `[${c.icon}](${c.command} "${c.text}")`)
        .join(' ')
      return row
    })
    .map(item => `| | **${item.locale}** | | ${item.value} | ${item.commands} |`)
    .join('\n')

  if (!transTable)
    return ''

  return `| | | | | |\n|---|---:|---|---|---:|\n${transTable}\n| | | | | |`
}

export function createHover (keypath: string, maxLength = 0) {
  const loader = CurrentFile.loader
  const records = loader.getTranslationsByKey(keypath)
  const displayLocale = Config.displayLanguage

  const locales = Global.visibleLocales.filter(i => i !== displayLocale)
  const table1 = createTable(locales, records, maxLength)
  const table2 = createTable([displayLocale], records, maxLength)
  const markdown = `${table1}\n\n-----\n\n${table2}`

  const markdownText = new MarkdownString(markdown)
  markdownText.isTrusted = true

  return markdownText
}
