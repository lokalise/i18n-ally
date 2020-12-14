import PO from 'pofile'
import { Parser } from './base'

export class PoParser extends Parser {
  id = 'po'

  constructor() {
    super(['po'], 'po(?:t|tx)?')
  }

  readonly = true

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
}
