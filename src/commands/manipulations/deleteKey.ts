import { window } from 'vscode'
import { LocaleTreeItem, UsageReportRootItem } from '../../views'
import { LocaleRecord, CurrentFile, Analyst } from '../../core'
import { Log } from '../../utils'
import i18n from '../../i18n'

export async function DeleteRecords(records: LocaleRecord[]) {
  try {
    await CurrentFile.loader.write(
      records
        .filter(record => !record.shadow)
        .map(record => ({
          value: undefined,
          keypath: record.keypath,
          filepath: record.filepath,
          locale: record.locale,
          features: record.features,
        })),
      false,
    )
  }
  catch (err) {
    Log.error(err.toString())
  }
}

export async function DeleteKey(item: LocaleTreeItem | UsageReportRootItem) {
  const Yes = i18n.t('prompt.button_yes')

  if (item instanceof LocaleTreeItem) {
    let records: LocaleRecord[] = []
    const { node } = item
    if (node.type === 'tree')
      return

    if (node.type === 'record')
      return

    records = Object.values(node.locales)

    if (Yes !== await window.showWarningMessage(
      i18n.t('prompt.delete_key', node.keypath),
      { modal: true },
      Yes,
    ))
      return

    await DeleteRecords(records)
  }
  else if (item instanceof UsageReportRootItem && item.key === 'idle') {
    const records: LocaleRecord[] = []

    if (Yes !== await window.showWarningMessage(
      i18n.t('prompt.delete_keys_not_in_use', item.keys.length),
      { modal: true },
      Yes,
    ))
      return

    for (const usage of item.keys) {
      const node = CurrentFile.loader.getNodeByKey(usage.keypath)
      records.push(...Object.values(node?.locales || {}))
    }

    await DeleteRecords(records)
  }

  if (Analyst.hasCache()) {
    setTimeout(() => {
      Analyst.analyzeUsage(false)
    }, 500)
  }
}
