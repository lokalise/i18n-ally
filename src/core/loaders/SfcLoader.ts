import { workspace, Uri, TextDocument, WorkspaceEdit, Range } from 'vscode'
import { squeeze, SFCI18nBlock, MetaLocaleMessage, infuse } from 'vue-i18n-locale-message'
import { Log, applyPendingToObject, File } from '../../utils'
import { LocaleTree, PendingWrite, NodeOptions } from '../types'
import { Loader } from './Loader'
import { Global } from '..'

export class SFCLoader extends Loader {
  constructor (
    public readonly uri: Uri,
  ) {
    super(`[SFC]${uri.fsPath}`)

    this.load()
  }

  _parsedSections: SFCI18nBlock[] = []
  _meta: MetaLocaleMessage | undefined

  get filepath () {
    return this.uri.fsPath
  }

  get files () {
    return [{ filepath: this.filepath, locale: '', nested: false }]
  }

  async load () {
    const filepath = this.filepath
    Log.info(`📑 Loading sfc ${filepath}`)
    const doc = await workspace.openTextDocument(this.uri)
    const meta = this._meta = squeeze(Global.rootpath, this.getSFCFileInfo(doc))
    this._parsedSections = meta.components[filepath]

    this.updateLocalesTree()
    this._onDidChange.fire(this.name)
  }

  private getOptions (section: SFCI18nBlock, locale: string, index: number): NodeOptions {
    return {
      filepath: section.src || this.uri.fsPath,
      locale,
      sfc: true,
      meta: {
        sfcSectionIndex: index,
      },
    }
  }

  private getSFCFileInfo (doc: TextDocument) {
    return [{
      path: this.filepath,
      content: doc.getText(),
    }]
  }

  _locales = new Set<string>()

  private updateLocalesTree () {
    this._flattenLocaleTree = {}
    this._locales = new Set()

    const tree = new LocaleTree({ keypath: '', sfc: true })
    for (const [index, section] of this._parsedSections.entries()) {
      if (!section.messages)
        continue
      for (const [locale, value] of Object.entries(section.messages)) {
        this._locales.add(locale)
        this.updateTree(tree, value, '', '', this.getOptions(section, locale, index))
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

  async write (pendings: PendingWrite | PendingWrite[]) {
    console.log('Write to SFC')
    if (!Array.isArray(pendings))
      pendings = [pendings]
    pendings = pendings.filter(i => i)

    if (!this._meta)
      return

    for (const pending of pendings) {
      const record = this.getRecordByKey(pending.keypath, pending.locale, true)
      if (!record)
        continue

      const sectionIndex = record.meta ? (record.meta.sfcSectionIndex || 0) : 0

      const section = this._meta.components[this.filepath][sectionIndex]

      section.messages[pending.locale] = await applyPendingToObject(section.messages[pending.locale] || {}, pending)
    }

    const doc = await workspace.openTextDocument(this.uri)
    const [file] = infuse(Global.rootpath, this.getSFCFileInfo(doc), this._meta)

    if (doc.isDirty) {
      const edit = new WorkspaceEdit()
      edit.replace(this.uri, new Range(doc.positionAt(0), doc.positionAt(Infinity)), file.content)

      await workspace.applyEdit(edit)
    }
    else {
      await File.write(this.filepath, file.content)
    }

    await this.load()
  }

  canHandleWrites (pending: PendingWrite) {
    return !!this._meta && pending.filepath === this.filepath
  }
}
