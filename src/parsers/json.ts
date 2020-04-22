import * as SortedStringify from 'json-stable-stringify'
// @ts-ignore
import JsonMap from 'json-source-map'
import { Parser } from './base'

export class JsonParser extends Parser {
  id = 'json'

  constructor() {
    super(['json'], 'json')
  }

  async parse(text: string) {
    if (!text || !text.trim())
      return {}
    return JSON.parse(text)
  }

  async dump(object: object, sort: boolean) {
    if (sort)
      return `${SortedStringify(object, { space: this.options.indent })}\n`
    else
      return `${JSON.stringify(object, null, this.options.indent)}\n`
  }

  annotationSupported = true
  annotationLanguageIds = ['json']

  parseAST(text: string) {
    if (!text || !text.trim())
      return []

    const map = JsonMap.parse(text).pointers
    const pairs = Object.entries<any>(map)
      .filter(([k, v]) => k)
      .map(([k, v]) => ({
        start: v.value.pos + 1,
        end: v.valueEnd.pos - 1,
        // https://tools.ietf.org/html/rfc6901
        key: k.slice(1)
          .replace(/\//g, '.')
          .replace(/~0/g, '~')
          .replace(/~1/g, '/'),
      }))

    return pairs
  }
}
