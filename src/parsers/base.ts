/* eslint-disable @typescript-eslint/no-unused-vars */
import { TextDocument } from 'vscode'
import { KeyStyle, ParserOptions, KeyInDocument, Config } from '~/core'
import { File } from '~/utils'

export abstract class Parser {
  abstract readonly id: string

  private supportedExtsRegex: RegExp

  readonly readonly: boolean = false

  private detectedIndentSize!: number

  constructor(
    public readonly languageIds: string[],
    public readonly supportedExts: string,
    public options: ParserOptions = {
      get indent() {
        return Config.indent
      },
      get tab() {
        return Config.tabStyle
      },
      get useDetectIndent() {
        return Config.useDetectIndent
      },
    },
  ) {
    this.supportedExtsRegex = new RegExp(`.?(${this.supportedExts})$`)
  }

  supports(ext: string) {
    return !!ext.toLowerCase().match(this.supportedExtsRegex)
  }

  async load(filepath: string): Promise<object> {
    const raw = await File.read(filepath)
    if (!raw)
      return {}

    this.detectedIndentSize = this.detectIndentSize(raw) ?? Config.indent
    return await this.parse(raw)
  }

  detectIndentSize(text: string): number | null { return null }

  async save(filepath: string, object: object, sort: boolean, compare: ((x: string, y: string) => number) | undefined) {
    const text = await this.dump(object, sort, compare, this.detectedIndentSize)
    await File.write(filepath, text)
  }

  abstract parse(text: string): Promise<object>

  abstract dump(object: object, sort: boolean, compare: ((x: string, y: string) => number) | undefined, detectedIndentSize: number): Promise<string>

  parseAST(text: string): KeyInDocument[] {
    return []
  }

  navigateToKey(text: string, keypath: string, keystyle: KeyStyle) {
    return this.parseAST(text).find(k => k.key === keypath)
  }

  annotationSupported = false
  annotationLanguageIds: string[] = []
  annotationGetKeys(document: TextDocument) {
    return this.parseAST(document.getText())
  }
}
