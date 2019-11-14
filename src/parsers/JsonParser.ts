import * as SortedStringify from 'json-stable-stringify'
// @ts-ignore
import JsonMap from 'json-source-map'
import { Parser } from './Parser'

export class JsonParser extends Parser {
  constructor () {
    super(['json'], /\.?json$/g)
  }

  async parse (text: string) {
    return JSON.parse(text)
  }

  async dump (object: object, sort: boolean) {
    if (sort)
      return SortedStringify(object, { space: this.options.indent })
    else
      return JSON.stringify(object, null, this.options.indent)
  }

  annotationSupported = true
  annotationLanguageIds = ['json']

  parseAST (text: string) {
    const map = JsonMap.parse(text).pointers
    const pairs = Object.entries<any>(map)
      .filter(([k, v]) => k)
      .map(([k, v]) => ({ start: v.value.pos, end: v.valueEnd.pos, key: k.replace(/\//g, '.').slice(1) }))

    return pairs
  }
}
