import { LocaleTreeView } from '../../views/LocalesTreeView'
import { LocaleRecord, CurrentFile } from '../../core'
import { Log } from '../../utils'

export async function DeleteKey ({ node }: LocaleTreeView) {
  let records: LocaleRecord[] = []

  if (node.type === 'tree')
    return

  else if (node.type === 'record')
    records = [node]

  else
    records = Object.values(node.locales)

  try {
    await CurrentFile.loader.write(records
      .filter(record => !record.shadow)
      .map(record => ({
        value: undefined,
        keypath: record.keypath,
        filepath: record.filepath,
        locale: record.locale,
        sfc: record.sfc,
      })))
  }
  catch (err) {
    Log.error(err.toString())
  }
}
