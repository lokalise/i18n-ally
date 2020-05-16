
import { Parser } from './base'
// @ts-ignore
import properties from 'properties'

export class Properties extends Parser {
  id = 'properties'

  constructor() {
    super(['properties'], 'properties')
  }

  async parse(text: string) {
    return properties.parse(text)
  }

  async dump(object: object) {
    return properties.stringify(object)
  }
}
