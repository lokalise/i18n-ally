import { workspace, Uri } from 'vscode'
import { squeeze, SFCI18nBlock } from 'vue-i18n-locale-message'
import { Log } from '../../utils'
import { LocaleTree } from '../types'
import { Loader, NodeOptions } from './Loader'
import { Global } from '..'

export class SFCLoader extends Loader {
  constructor (
    public readonly uri: Uri,
  ) {
    super(`[SFC]${uri.fsPath}`)

    this.load()
  }

  get files () {
    return [{ filepath: this.uri.fsPath, locale: '', nested: false }]
  }

  _parsedSections: SFCI18nBlock[] = []

  async load () {
    const filepath = this.uri.fsPath
    Log.info(`📑 Loading sfc ${filepath}`)
    const doc = await workspace.openTextDocument(this.uri)
    const meta = squeeze(Global.rootpath, [{
      path: filepath,
      content: doc.getText(),
    }])
    this._parsedSections = meta.components[filepath]

    this.updateLocalesTree()
    this._onDidChange.fire(this.name)
  }

  private getOptions (section: SFCI18nBlock, locale: string): NodeOptions {
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
      if (!section.messages)
        continue
      for (const [locale, value] of Object.entries(section.messages)) {
        this._locales.add(locale)
        this.updateTree(tree, value, '', '', this.getOptions(section, locale))
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
