import { Parser } from './Parser'
import { KeyStyle } from '../core'
// @ts-ignore
import * as SortedStringify from 'json-stable-stringify'

export class JsonParser extends Parser {
  constructor () {
    super(['json'], /\.?json$/g)
  }

  async parse (text: string) {
    return JSON.parse(text)
  }

  async dump (object: object, sort: boolean) {
    if (sort)
      return SortedStringify(object, { space: 2 })
    else
      return JSON.stringify(object, null, this.options.indent)
  }

  navigateToKey (text: string, keypath: string, keystyle: KeyStyle) {
    const keys = keystyle === 'flat'
      ? [keypath]
      : keypath.split('.')

    // build regex to search key
    let regexString = keys
      .map((key, i) => `^[ \\t]{${(i + 1) * this.options.indent}}"${key}": ?`)
      .join('[\\s\\S]*')
    regexString += '(?:"(.*)"|({))'
    const regex = new RegExp(regexString, 'gm')

    const match = regex.exec(text)
    if (match && match.length >= 2) {
      const end = match.index + match[0].length - 1
      const value = match[1] || match[2]
      const start = end - value.length
      return { start, end }
    }
    else {
      return undefined
    }
  }
}
