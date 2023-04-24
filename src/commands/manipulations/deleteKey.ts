import { window } from 'vscode'
import { Log } from '~/utils'
import { LocaleTreeItem, UsageReportRootItem } from '~/views'
import i18n from '~/i18n'
import { LocaleRecord, CurrentFile, Analyst } from '~/core'
import { Telemetry, TelemetryKey } from '~/core/Telemetry'

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
    Log.error((err as Error).toString())
  }
}

export async function DeleteKey(item: LocaleTreeItem | UsageReportRootItem) {
  Telemetry.track(TelemetryKey.DeleteKey)

  const Yes = i18n.t('prompt.button_yes')
  let records: LocaleRecord[] = []

  if (item instanceof LocaleTreeItem) {
    const { node } = item
    if (node.type === 'tree')
      return
    if (node.type === 'record')
      return

    records = Object.values(node.locales)

    if (Yes !== await window.showInformationMessage(
      i18n.t('prompt.delete_key', node.keypath),
      { modal: true },
      Yes,
    ))
      return
  }
  else if (item instanceof UsageReportRootItem && item.key === 'idle') {
    if (Yes !== await window.showInformationMessage(
      i18n.t('prompt.delete_keys_not_in_use', item.keys.length),
      { modal: true },
      Yes,
    ))
      return

    for (const usage of item.keys) {
      const node = CurrentFile.loader.getNodeByKey(usage.keypath)
      records.push(...Object.values(node?.locales || {}))
    }
  }
  else {
    return
  }

  await DeleteRecords(records)

  if (Analyst.hasCache()) {
    setTimeout(() => {
      Analyst.analyzeUsage(false)
    }, 500)
  }

  window.showInformationMessage(i18n.t('prompt.keys_removed', records.length))
}
