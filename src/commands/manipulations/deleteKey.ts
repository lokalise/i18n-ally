import { window } from 'vscode'
import { LocaleTreeItem, UsageReportRootItem } from '../../views'
import { LocaleRecord, CurrentFile, Analyst } from '../../core'
import { Log } from '../../utils'
import i18n from '../../i18n'

export async function DeleteRecords (records: LocaleRecord[]) {
  try {
    await CurrentFile.loader.write(records
      .filter(record => !record.shadow)
      .map(record => ({
        value: undefined,
        keypath: record.keypath,
        filepath: record.filepath,
        locale: record.locale,
        features: record.features,
      })), false)
  }
  catch (err) {
    Log.error(err.toString())
  }
}

export async function DeleteKey (item: LocaleTreeItem | UsageReportRootItem) {
  if (item instanceof LocaleTreeItem) {
    let records: LocaleRecord[] = []
    const { node } = item
    if (node.type === 'tree')
      return

    else if (node.type === 'record')
      records = [node]

    else
      records = Object.values(node.locales)

    await DeleteRecords(records)
  }
  else if (item instanceof UsageReportRootItem && item.key === 'idle') {
    const records: LocaleRecord[] = []

    const Yes = i18n.t('prompt.button_yes')

    const result = await window.showWarningMessage(
      i18n.t('prompt.delete_keys_not_in_use', item.keys.length),
      { modal: true },
      Yes,
    )
    if (result !== Yes)
      return

    for (const usage of item.keys) {
      const node = CurrentFile.loader.getNodeByKey(usage.keypath)
      records.push(...Object.values(node?.locales || {}))
    }

    await DeleteRecords(records)

    setTimeout(() => {
      Analyst.analyzeUsage(false)
    }, 1000)
  }
}
