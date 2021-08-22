// @ts-ignore
import parser from 'php-array-parser'
import { Parser } from './base'

export class PhpParser extends Parser {
  id = 'php'
  readonly = true

  constructor() {
    super(['php'], 'php')
  }

  async parse(text: string) {
    // Remove left part of return expression and any ending `?>`.
    const ret = text.indexOf('return') + 'return'.length
    text = text.substr(ret)
    text = text.replace(/\?>\s*$/, '_')
    return parser.parse(text)
  }

  async dump() {
    return ''
  }
}
