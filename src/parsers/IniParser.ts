import { Parser } from './Parser'
import ini from 'ini'

export class IniParser extends Parser {
  id = 'ini'

  constructor() {
    super(['ini'], /\.?ini$/g)
  }

  async parse(text: string) {
    return ini.parse(text)
  }

  async dump(object: object) {
    return ini.stringify(object)
  }
}
