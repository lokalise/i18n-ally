import { workspace, window, EventEmitter, Event, Disposable } from 'vscode'
import { promises as fs, existsSync } from 'fs'
import * as _ from 'lodash'
import * as path from 'path'
// @ts-ignore
import { Global } from './Global'
import { MachinTranslate } from './MachineTranslate'
import { getKeyname, getFileInfo, replaceLocalePath, notEmpty } from './utils'
import { LocaleTree, ParsedFile, FlattenLocaleTree, Coverage, LocaleNode, LocaleRecord, PendingWrite } from './types'
import { AllyError, ErrorType } from './Errors'

function newTree (keypath = '', values = {}): LocaleTree {
  return {
    keypath,
    keyname: getKeyname(keypath),
    children: {},
    values,
    type: 'tree',
  }
}

export class LocaleLoader extends Disposable {
  private _onDidChange: EventEmitter<undefined> = new EventEmitter<undefined>()
  readonly onDidChange: Event<undefined> = this._onDidChange.event

  private _files: Record<string, ParsedFile> = {}
  private _flattenLocaleTree: FlattenLocaleTree = {}
  private _localeTree: LocaleTree = newTree()
  private _disposables: Disposable[]=[]

  constructor (public readonly rootpath: string) {
    super(() => this.onDispose())
  }

  async init () {
    Global.outputChannel.appendLine(`Initializing loader "${this.rootpath}"`)
    await this.loadAll()
    this.update()
  }

  get localesPaths () {
    return Global.localesPaths
  }

  get locales () {
    const source = Global.sourceLanguage
    return _(this._files)
      .values()
      .map(f => f.locale)
      .uniq()
      .sort((x, y) => x === source
        ? -1
        : y === source
          ? 1
          : 0)
      .value()
  }

  get flattenLocaleTree () {
    return this._flattenLocaleTree
  }

  get localeTree () {
    return this._localeTree
  }

  getCoverage (locale: string, keys?: string[]): Coverage {
    keys = keys || Object.keys(this._flattenLocaleTree)
    const total = keys.length
    const translated = keys.filter(key => {
      return this._flattenLocaleTree[key] && this._flattenLocaleTree[key].getValue(locale)
    })
    return {
      locale,
      total,
      translated: translated.length,
      keys,
    }
  }

  getNodeByKey (keypath: string): LocaleNode | undefined {
    return this._flattenLocaleTree[keypath]
  }

  getTranslationsByKey (keypath: string, shadow = true) {
    const node = this.getNodeByKey(keypath)
    if (!node)
      return {}
    if (shadow)
      return this.getShadowLocales(node)
    else
      return node.locales
  }

  getRecordByKey (keypath: string, locale: string): LocaleRecord | undefined {
    const trans = this.getTranslationsByKey(keypath)
    return trans[locale]
  }

  getTreeNodeByKey (keypath: string, tree?: LocaleTree): LocaleNode | LocaleTree | undefined {
    tree = tree || this._localeTree

    // flatten style
    let node = tree.children[keypath]
    if (node)
      return node

    // tree style
    const keys = keypath.split('.')
    const root = keys[0]
    const remaining = keys.slice(1).join('.')
    node = tree.children[root]
    if (!remaining)
      return node
    if (node && node.type === 'tree')
      return this.getTreeNodeByKey(remaining, node)
    return undefined
  }

  getValueByKey (keypath: string, locale?: string, clamp: boolean = true, stringifySpace?: number) {
    locale = locale || Global.displayLanguage

    const maxlength = 50 // TODO: a configure for this
    const node = this.getTreeNodeByKey(keypath)

    if (!node)
      return undefined

    if (node.type === 'tree') {
      const value = node.values[locale]
      if (!value)
        return undefined
      let text = JSON
        .stringify(value, null, stringifySpace)
        .replace(/"(\w+?)":/g, ' $1:')
        .replace(/}/, ' }')

      if (clamp && maxlength && text.length > maxlength)
        text = '{...}'
      return text
    }
    else {
      let value = node.getValue(locale)
      if (clamp && maxlength && value.length > maxlength)
        value = `${value.substring(0, maxlength)}...`
      return value
    }
  }

  getFilepathByKey (key: string, locale?: string) {
    locale = locale || Global.displayLanguage
    const files = Object.values(this._files).filter(f => f.locale === locale)
    for (const file of files) {
      if (_.get(file.value, key))
        return file.filepath
    }
    return undefined
  }

  getClosestNodeByKey (keypath: string, tree?: LocaleTree): LocaleNode | LocaleTree | undefined {
    tree = tree || this._localeTree
    const keys = keypath.split('.')
    const root = keys[0]
    const remaining = keys.slice(1).join('.')
    const node = tree.children[root]

    if (node) {
      // end of the search
      if (node.type === 'node' || !remaining)
        return node
      // go deeper
      if (node.type === 'tree')
        return this.getClosestNodeByKey(remaining, node)
    }
    // still at the root, nothing found
    if (tree === this._localeTree)
      return undefined
    // return last node
    return tree
  }

  getDisplayingTranslateByKey (key: string): LocaleRecord | undefined {
    const node = this.getNodeByKey(key)
    return node && node.locales[Global.displayLanguage]
  }

  getFilepathsOfLocale (locale: string) {
    return Object.values(this._files)
      .filter(f => f.locale === locale)
      .map(f => f.filepath)
  }

  async requestMissingFilepath (locale: string, keypath: string) {
    const paths = this.getFilepathsOfLocale(locale)
    if (paths.length === 1)
      return paths[0]
    if (paths.length === 0) {
      return await window.showInputBox({
        prompt: `Enter the file path to store key "${keypath}"`,
        placeHolder: `path/to/${locale}.json`,
      })
    }
    return await window.showQuickPick(paths, {
      placeHolder: `Select which file to store key "${keypath}"`,
      ignoreFocusOut: true,
    })
  }

  private async MachineTranslateRecord (record: LocaleRecord, sourceLanguage: string): Promise<PendingWrite|undefined> {
    if (record.locale === sourceLanguage)
      throw new AllyError(ErrorType.translating_same_locale)
    const sourceNode = this.getNodeByKey(record.keypath)
    if (!sourceNode)
      throw new AllyError(ErrorType.translating_empty_source_value)
    const sourceRecord = sourceNode.locales[sourceLanguage]
    if (!sourceRecord || !sourceRecord.value)
      throw new AllyError(ErrorType.translating_empty_source_value)
    try {
      const result = await MachinTranslate(sourceRecord.value, sourceLanguage, record.locale)

      return {
        locale: record.locale,
        value: result,
        filepath: record.filepath,
        keypath: record.keypath,
      }
    }
    catch (e) {
      throw new AllyError(ErrorType.translating_unknown_error, undefined, e)
    }
  }

  private async MachineTranslateNode (node: LocaleNode, sourceLanguage: string): Promise<PendingWrite[]> {
    const tasks = Object.values(this.getShadowLocales(node))
      .filter(record => record.locale !== sourceLanguage)
      .map(record => this.MachineTranslateRecord(record, sourceLanguage))

    const pendings = await Promise.all(tasks)

    return pendings.filter(notEmpty)
  }

  async MachineTranslate (node: LocaleNode| LocaleRecord, sourceLanguage?: string) {
    sourceLanguage = sourceLanguage || Global.sourceLanguage
    if (node.type === 'node')
      return await this.MachineTranslateNode(node, sourceLanguage)

    const pending = await this.MachineTranslateRecord(node, sourceLanguage)

    return [pending].filter(notEmpty)
  }

  getShadowFilePath (keypath: string, locale: string) {
    const paths = this.getFilepathsOfLocale(locale)
    if (paths.length === 1)
      return paths[0]

    const node = this.getNodeByKey(keypath)
    if (node) {
      const sourceRecord = node.locales[Global.sourceLanguage] || Object.values(node.locales)[0]
      if (sourceRecord && sourceRecord.filepath)
        return replaceLocalePath(sourceRecord.filepath, locale)
    }
    return undefined
  }

  getShadowLocales (node: LocaleNode) {
    const locales: Record<string, LocaleRecord> = {}

    Global.getVisibleLocales(this.locales)
      .forEach(locale => {
        if (node.locales[locale]) {
        // locales already exists
          locales[locale] = node.locales[locale]
        }
        else {
        // create shadow locale
          locales[locale] = {
            locale,
            value: '',
            shadow: true,
            keyname: node.keyname,
            keypath: node.keypath,
            filepath: this.getShadowFilePath(node.keypath, locale),
            type: 'record',
          }
        }
      })
    return locales
  }

  async writeToSingleFile (pending: PendingWrite) {
    let filepath = pending.filepath
    if (!filepath)
      filepath = await this.requestMissingFilepath(pending.locale, pending.keypath)

    if (!filepath)
      throw new AllyError(ErrorType.filepath_not_specified)

    Global.outputChannel.appendLine(`Saving file ${filepath}`)
    const ext = path.extname(filepath)
    const parser = Global.getMatchedParser(ext)
    if (!parser)
      throw new AllyError(ErrorType.unsupported_file_type, ext)

    let original: object = {}
    if (existsSync(filepath))
      original = await parser.load(filepath)

    _.set(original, pending.keypath, pending.value)

    await parser.save(filepath, original)
  }

  private _ignoreChanges = false
  async writeToFile (pendings: PendingWrite|PendingWrite[]) {
    this._ignoreChanges = true
    if (!Array.isArray(pendings))
      pendings = [pendings]
    pendings = pendings.filter(i => i)
    try {
      for (const pending of pendings)
        await this.writeToSingleFile(pending)
    }
    catch (e) {
      this._ignoreChanges = false
      throw e
    }
    this._ignoreChanges = false
    for (const pending of pendings) {
      if (pending.filepath)
        await this.loadFile(pending.filepath)
    }
  }

  private async loadFile (filepath: string) {
    try {
      Global.outputChannel.appendLine(`Loading file ${filepath}`)
      const { locale, nested } = getFileInfo(filepath)
      const ext = path.extname(filepath)
      const parser = Global.getMatchedParser(ext)
      if (!parser)
        return new AllyError(ErrorType.unsupported_file_type, ext)
      const value = await parser.load(filepath)
      this._files[filepath] = {
        filepath,
        locale,
        value,
        nested,
      }
    }
    catch (e) {
      this.unsetFile(filepath)
      Global.outputChannel.appendLine(`Failed to load file ${e}`)
      console.error(e)
    }
  }

  private unsetFile (filepath: string) {
    delete this._files[filepath]
  }

  private async loadDirectory (rootPath: string) {
    const paths = await fs.readdir(rootPath)
    for (const filename of paths) {
      // filename starts with underscore will be ignored
      if (filename.startsWith('_'))
        continue

      const filePath = path.resolve(rootPath, filename)
      const isDirectory = (await fs.lstat(filePath)).isDirectory()

      const ext = path.extname(filePath)

      if (!isDirectory && !Global.getMatchedParser(ext))
        continue

      if (!isDirectory) {
        await this.loadFile(filePath)
      }
      else {
        for (const p of await fs.readdir(filePath))
          await this.loadFile(path.resolve(filePath, p))
      }
    }
  }

  private async watchOn (rootPath: string) {
    const watcher = workspace.createFileSystemWatcher(`${rootPath}/**`)

    const updateFile = async (type: string, { fsPath: filepath }: { fsPath: string }) => {
      if (this._ignoreChanges)
        return
      filepath = path.resolve(filepath)
      const { ext } = path.parse(filepath)
      if (!Global.getMatchedParser(ext))
        return

      switch (type) {
        case 'del':
          delete this._files[filepath]
          this.update()
          break

        case 'change':
        case 'create':
          await this.loadFile(filepath)
          this.update()
          break
      }
    }
    watcher.onDidChange(updateFile.bind(this, 'change'))
    watcher.onDidCreate(updateFile.bind(this, 'create'))
    watcher.onDidDelete(updateFile.bind(this, 'del'))

    this._disposables.push(watcher)
  }

  private updateLocalesTree () {
    this._flattenLocaleTree = {}
    const subTree = (object: object, keypath: string, file: ParsedFile, tree?: LocaleTree) => {
      tree = tree || newTree(keypath)
      tree.values[file.locale] = object
      for (const [key, value] of Object.entries(object)) {
        const newKeyPath = keypath ? `${keypath}.${key}` : key

        // should go nested
        if (_.isObject(value)) {
          let originalTree: LocaleTree|undefined
          if (tree.children[key] && tree.children[key].type === 'tree')
            originalTree = tree.children[key] as LocaleTree

          tree.children[key] = subTree(value, newKeyPath, file, originalTree)
          continue
        }

        // init node
        if (!tree.children[key]) {
          const node = new LocaleNode(newKeyPath)
          tree.children[key] = node
          this._flattenLocaleTree[node.keypath] = node
        }

        // add locales to exitsing node
        const node = tree.children[key]
        if (node.type === 'node') {
          node.locales[file.locale] = {
            keypath: newKeyPath,
            keyname: key,
            value,
            locale: file.locale,
            filepath: file.filepath,
            type: 'record',
          }
        }
      }
      return tree
    }

    const tree = newTree()
    for (const file of Object.values(this._files))
      subTree(file.value, '', file, tree)
    this._localeTree = tree
  }

  private update () {
    this.updateLocalesTree()
    this._onDidChange.fire()
  }

  private async loadAll () {
    for (const pathname of this.localesPaths) {
      const fullpath = path.resolve(this.rootpath, pathname)
      Global.outputChannel.appendLine(`Loading locales under ${fullpath}`)
      await this.loadDirectory(fullpath)
      this.watchOn(fullpath)
    }
  }

  private onDispose () {
    Global.outputChannel.appendLine(`Disposing loader "${this.rootpath}"`)
    this._disposables.forEach(d => d.dispose())
    this._disposables = []
  }
}
