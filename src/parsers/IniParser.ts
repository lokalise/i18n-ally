import ini from 'ini'
import { Parser } from './Parser'

export class IniParser extends Parser {
  constructor () {
    super(['ini'], /\.?ini$/g)
  }

  async parse (text: string) {
    return ini.parse(text)
  }

  async dump (object: object) {
    return ini.stringify(object)
  }
}
