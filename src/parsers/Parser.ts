
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

  constructor (
    public readonly languageIds: string[],
    public readonly supportedExts: string|RegExp,
    public options: ParserOptions = { indent: 2, tab: ' ' }
  ) {
    this.supportedExtsRegex = new RegExp(supportedExts)
  }

  supports (ext: string) {
    return !!ext.toLowerCase().match(this.supportedExtsRegex)
  }

  abstract parse(text: string): Promise<object>
  abstract dump(object: object): Promise<string>
  abstract navigateToKey(text: string, keypath: string): PositionRange | undefined
}
