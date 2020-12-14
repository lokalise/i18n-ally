
import properties from 'properties'
import { Parser } from './base'
// @ts-ignore

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
