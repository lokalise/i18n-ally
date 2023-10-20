import SortedStringify from 'json-stable-stringify'
// @ts-ignorex
import JsonMap from 'json-source-map'
import { Parser } from './base'

export class ArbParser extends Parser {
  id = 'arb'

  constructor() {
    super(['arb'], 'arb')
  }

  async parse(text: string) {
    if (!text || !text.trim())
      return {}
    return JSON.parse(text)
  }

  async dump(object: object, sort: boolean, compare: ((x: string, y: string) => number) | undefined) {
    const indent = this.options.tab === '\t' ? this.options.tab : this.options.indent

    if (sort)
      return `${SortedStringify(object, { space: indent, cmp: compare ? (a, b) => compare(a.key, b.key) : undefined })}\n`
    else
      return `${JSON.stringify(object, null, indent)}\n`
  }

  annotationSupported = true
  annotationLanguageIds = ['arb']

  parseAST(text: string) {
    if (!text || !text.trim())
      return []

    const map = JsonMap.parse(text).pointers
    const pairs = Object.entries<any>(map)
      .filter(([k, v]) => k)
      .map(([k, v]) => ({
        quoted: true,
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
