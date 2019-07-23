import { extname } from 'path'
import { workspace, Uri } from 'vscode'
import { parse, HTMLElement } from 'node-html-parser'
import { BaseLoader } from './BaseLoader'
import { LocaleTree } from './types'
import { Global } from './Global'

interface Section {
  lang: string
  index: number
  locale?: string
  content?: string
  src?: string
}

interface ParseredSection extends Section{
  data: any
}

export class SFCLoader extends BaseLoader {
  _root: LocaleTree = new LocaleTree({ keypath: '' })

  constructor (
    public readonly filepath: string
  ) {
    super(`[SFC]${filepath}`)
  }

  private getSections (text: string): Section[] {
    const root = parse(text)
    const elements = root.childNodes.filter(node => node instanceof HTMLElement && node.tagName === 'i18n') as HTMLElement[]
    return elements.map((el, index) => {
      const query = el.attributes
      const lang = query.lang || extname(query.src || '') || 'json'
      return {
        ...query,
        index,
        lang,
        content: el.innerHTML,
      }
    })
  }

  private async loadSection (section: Section) {
    if (!section.content && !section.src)
      return undefined

    if (section.content && section.src)
      throw new Error('can not use inline and "src" at the same time')

    const parser = Global.getMatchedParser(section.lang)

    if (!parser)
      throw new Error(`unsupported lang ${section.lang}`)

    let data: any
    if (section.src)
      data = await parser.load(section.src)
    else if (section.content)
      data = await parser.parse(section.content)

    return data
  }

  _parsedSections: ParseredSection[] = []

  async load () {
    const doc = await workspace.openTextDocument(Uri.file(this.filepath))
    const sections = this.getSections(doc.getText())
    for (const section of sections) {
      const data = await this.loadSection(section)
      if (data)
        this._parsedSections.push({ ...section, data })
    }
    // TODO: parser to tree
    console.log(this._parsedSections)
  }

  get root () {
    return this._root
  }

  get locales () {
    return [] // TODO:
  }

  getShadowFilePath (keypath: string, locale: string) {
    return this.filepath
  }
}