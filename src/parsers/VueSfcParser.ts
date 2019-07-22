import { Dictionary } from 'lodash'
import { KeyStyle } from '../core'
import { Parser, PositionRange } from './Parser'

const SFC_REGEX = /<i18n ?(.*)(?:>([\s\S]*?)<\/i18n>|\/>)/gim
const HTML_QUERY_REGEX = /(\w+)=['"](.*?)['"]/g

interface Section {
  lang?: string
  locale?: string
  content?: string
  src?: string
}

export class VueSfcParser extends Parser {
  constructor () {
    super(['vue'], /\.?vue$/g)
  }

  getQuery (text: string) {
    const mathes = Array.from(HTML_QUERY_REGEX.exec(text) || [])
    const result: Dictionary<string> = {}
    for (const m of mathes) {
      const [, key, value] = m
      result[key.toLocaleLowerCase()] = value
    }
    return result
  }

  getSections (text: string): Section[] {
    const mathes = Array.from(SFC_REGEX.exec(text) || [])
    return mathes.map((m) => {
      const [, queryStr, content] = m
      const query = this.getQuery(queryStr)
      return {
        ...query,
        content,
      }
    })
  }

  async parse (text: string) {
    return {} // TODO:
  }

  async dump (object: object, sort: boolean) {
    return ''
  }

  navigateToKey (text: string, keypath: string, keystyle: KeyStyle): PositionRange | undefined {
    throw new Error('Method not implemented.')
  }
}
