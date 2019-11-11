import { promises as fs } from 'fs'
import { KeyStyle } from '../core'

export interface PositionRange {
  start: number
  end: number
}

export interface ParserOptions {
  indent: number
  tab: string
}

export abstract class Parser {
  private supportedExtsRegex: RegExp

  readonly readonly: boolean = false

  constructor (
    public readonly languageIds: string[],
    public readonly supportedExts: string|RegExp,
    public options: ParserOptions = { indent: 2, tab: ' ' },
  ) {
    this.supportedExtsRegex = new RegExp(supportedExts)
  }

  supports (ext: string) {
    return !!ext.toLowerCase().match(this.supportedExtsRegex)
  }

  async load (filepath: string): Promise<object> {
    const raw = await fs.readFile(filepath)
    let str = ''
    if (raw[0] === 0xEF && raw[1] === 0xBB && raw[2] === 0xBF) {
      str = raw.slice(3).toString('utf-8')
    } else {
      str = raw.toString('utf-8')
    }
    return await this.parse(str)
  }

  async save (filepath: string, object: object, sort: boolean) {
    const text = await this.dump(object, sort)
    await fs.writeFile(filepath, text, 'utf-8')
  }

  abstract parse(text: string): Promise<object>

  abstract dump(object: object, sort: boolean): Promise<string>

  abstract navigateToKey(text: string, keypath: string, keystyle: KeyStyle): PositionRange | undefined
}
