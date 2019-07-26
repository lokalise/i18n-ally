import { extname } from 'path'
import { workspace, Uri } from 'vscode'
import { parse, HTMLElement } from 'node-html-parser'
import { Log } from '../../utils'
import { LocaleTree } from '../types'
import { Global } from '../Global'
import { Loader, NodeOptions } from './Loader'

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

export class SFCLoader extends Loader {
  constructor (
    public readonly uri: Uri
  ) {
    super(`[SFC]${uri.fsPath}`)

    this.load()
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
    Log.info(`📑 Loading sfc ${this.uri.fsPath}`)
    this._parsedSections = []
    const doc = await workspace.openTextDocument(this.uri)
    const sections = this.getSections(doc.getText())
    for (const section of sections) {
      const data = await this.loadSection(section)
      this._parsedSections.push({ ...section, data })
    }
    this.updateLocalesTree()
    this._onDidChange.fire(this.name)
  }

  private getOptions (section: ParseredSection, locale: string): NodeOptions {
    return {
      filepath: section.src || this.uri.fsPath,
      locale,
      readonly: true, // TODO:sfc write
      sfc: true,
    }
  }

  _locales = new Set<string>()

  private updateLocalesTree () {
    this._flattenLocaleTree = {}
    this._locales = new Set()

    const tree = new LocaleTree({ keypath: '', sfc: true })
    for (const section of this._parsedSections) {
      if (!section.data)
        continue
      if (section.locale) {
        this._locales.add(section.locale)
        this.updateTree(tree, section.data, '', '', this.getOptions(section, section.locale))
      }
      else {
        for (const [locale, value] of Object.entries(section.data)) {
          this._locales.add(locale)
          this.updateTree(tree, value, '', '', this.getOptions(section, locale))
        }
      }
    }
    this._localeTree = tree
  }

  get locales () {
    return Array.from(this._locales)
  }

  getShadowFilePath (keypath: string, locale: string) {
    return this.uri.fsPath
  }
}
