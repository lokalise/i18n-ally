import PO from 'pofile'
import { Parser } from './base'
import { File } from '~/utils'

export class PoParser extends Parser {
  id = 'po'

  constructor() {
    super(['po'], 'po(?:t|tx)?')
  }

  async parse(text: string) {
    const items = PO.parse(text).items
    const result: Record<string, string> = {}
    for (const item of items) {
      if (item.msgstr.length)
        result[item.msgid] = item.msgstr[0]
    }
    return result
  }

  async dump(object: object) {
    return ''
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override async save(filepath: string, object: Record<string, string>, sort: boolean, compare: ((x: string, y: string) => number) | undefined) {
    const raw = await File.read(filepath)
    const po_items = PO.parse(raw)

    const items = Object.keys(object).map((key) => {
      const item = new PO.Item()
      item.msgid = key
      item.msgstr = [object[key]]
      return item
    })

    const po = new PO()
    po.items = items
    po.comments = po_items.comments
    po.extractedComments = po_items.extractedComments
    po.headers = po_items.headers

    await new Promise<void>((resolve, reject) => {
      po.save(filepath, (err) => {
        if (err)
          reject(err)
        else
          resolve()
      })
    })
  }
}
