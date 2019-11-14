import JSON5 from 'json5'
import { KeyStyle } from '../core'
import { Parser } from './Parser'

export class Json5Parser extends Parser {
  constructor () {
    super(['json5'], /\.?json5$/g)
  }

  async parse (text: string) {
    return JSON5.parse(text)
  }

  async dump (object: object, sort: boolean) {
    return JSON5.stringify(object, {
      space: this.options.indent,
    })
  }

  navigateToKey (text: string, keypath: string, keystyle: KeyStyle) {
    const keys = keystyle === 'flat'
      ? [keypath]
      : keypath.split('.')

    // build regex to search key
    let regexString = keys
      .map((key, i) => `^[ \\t]{${(i + 1) * this.options.indent}}"?${key}"?: ?`)
      .join('[\\s\\S]*')
    regexString += '(?:"?(.*)"?|({))'
    const regex = new RegExp(regexString, 'gm')

    const match = regex.exec(text)
    if (match && match.length >= 2) {
      const end = match.index + match[0].length - 1
      const value = match[1] || match[2]
      const start = end - value.length
      return { start, end, key: keypath }
    }
    else {
      return undefined
    }
  }
}
