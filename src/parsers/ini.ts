import ini from 'ini'
import { Parser } from './base'

export class IniParser extends Parser {
  id = 'ini'

  constructor() {
    super(['ini'], 'ini')
  }

  async parse(text: string) {
    return ini.parse(text)
  }

  async dump(object: object) {
    return ini.stringify(object)
  }
}
