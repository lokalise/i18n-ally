import JSON5 from 'json5'
import { Parser } from './base'
import { KeyStyle } from '~/core'
import { determineJSON5TabSize } from '~/utils/indent'

export class Json5Parser extends Parser {
  id = 'json5'

  constructor() {
    super(['json5'], 'json5')
  }

  async parse(text: string) {
    if (!text || !text.trim())
      return {}
    return JSON5.parse(text)
  }

  async dump(object: object, sort: boolean, compare: ((x: string, y: string) => number) | undefined, detectedIndentSize: number) {
    const finalIndent = this.options.useDetectIndent ? detectedIndentSize : this.options.indent

    return JSON5.stringify(object, {
      space: this.options.tab === '\t' ? this.options.tab : finalIndent,
    })
  }

  override detectIndentSize(text: string): number | null {
    return determineJSON5TabSize(text)
  }

  navigateToKey(text: string, keypath: string, keystyle: KeyStyle) {
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
      return { start, end, key: keypath, quoted: true }
    }
    else {
      return undefined
    }
  }
}
