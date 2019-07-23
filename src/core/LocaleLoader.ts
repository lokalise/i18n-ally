import { promises as fs, existsSync } from 'fs'
import * as path from 'path'
import * as _ from 'lodash'
import { workspace, window, EventEmitter, WorkspaceEdit } from 'vscode'
import * as fg from 'fast-glob'
import { replaceLocalePath, normalizeLocale, Log } from '../utils'
import i18n from '../i18n'
import { Analyst } from '../analysis/Analyst'
import { LocaleTree, ParsedFile, FlattenLocaleTree, Coverage, LocaleNode, LocaleRecord, PendingWrite } from './types'
import { AllyError, ErrorType } from './Errors'
import { Translator } from './Translator'
import { BaseLoader } from './BaseLoader'
import { Global, Config } from '.'

export class LocaleLoader extends BaseLoader {
  private _onDidChange = new EventEmitter<undefined>()

  readonly onDidChange = this._onDidChange.event

  readonly translator: Translator

  readonly analyst: Analyst

  private _files: Record<string, ParsedFile> = {}

  private _flattenLocaleTree: FlattenLocaleTree = {}

  private _localeTree: LocaleTree = new LocaleTree({ keypath: '' })

  constructor (public readonly rootpath: string) {
    super(rootpath)
    this.translator = new Translator(this)
    this.analyst = new Analyst(this)
    this._disposables.push(
      this.translator.onDidChange(() => this._onDidChange.fire())
    )
    this._disposables.push(
      this.analyst.watch()
    )
  }

  async init () {
    Log.info(`🚀 Initializing loader "${this.rootpath}"`)
    await this.loadAll()
    this.update()
    if (Config.sfc)
      window.showInformationMessage('Experimental SFC support enabled.')
  }

  get localesPaths () {
    return Config.localesPaths
  }

  get locales () {
    const source = Config.sourceLanguage
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

  get root () {
    return this._localeTree
  }

  getCoverage (locale: string, keys?: string[]): Coverage {
    keys = keys || Object.keys(this._flattenLocaleTree)
    const total = keys.length
    const translated = keys.filter((key) => {
      return this._flattenLocaleTree[key] && this._flattenLocaleTree[key].getValue(locale)
    })
    return {
      locale,
      total,
      translated: translated.length,
      keys,
    }
  }

  getFilepathByKey (key: string, locale?: string) {
    locale = locale || Config.displayLanguage
    const files = Object.values(this._files).filter(f => f.locale === locale)
    for (const file of files) {
      if (_.get(file.value, key))
        return file.filepath
    }
    return undefined
  }

  getDisplayingTranslateByKey (key: string): LocaleRecord | undefined {
    const node = this.getNodeByKey(key)
    return node && node.locales[Config.displayLanguage]
  }

  private getFilepathsOfLocale (locale: string) {
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
        prompt: i18n.t('prompt.enter_file_path_to_store_key'),
        placeHolder: `path/to/${locale}.json`,
      })
    }
    return await window.showQuickPick(paths, {
      placeHolder: i18n.t('prompt.select_file_to_store_key'),
      ignoreFocusOut: true,
    })
  }

  getShadowFilePath (keypath: string, locale: string) {
    const paths = this.getFilepathsOfLocale(locale)
    if (paths.length === 1)
      return paths[0]

    const node = this.getNodeByKey(keypath)
    if (node) {
      const sourceRecord = node.locales[Config.sourceLanguage] || Object.values(node.locales)[0]
      if (sourceRecord && sourceRecord.filepath)
        return replaceLocalePath(sourceRecord.filepath, locale)
    }
    return undefined
  }

  async writeToSingleFile (pending: PendingWrite) {
    let filepath = pending.filepath
    if (!filepath)
      filepath = await this.requestMissingFilepath(pending.locale, pending.keypath)

    if (!filepath)
      throw new AllyError(ErrorType.filepath_not_specified)

    Log.info(`💾 Writing ${filepath}`)
    const ext = path.extname(filepath)
    const parser = Global.getMatchedParser(ext)
    if (!parser)
      throw new AllyError(ErrorType.unsupported_file_type, ext)

    let original: any = {}
    if (existsSync(filepath))
      original = await parser.load(filepath)

    const keyStyle = await Config.requestKeyStyle()
    if (keyStyle === 'flat')
      original[pending.keypath] = pending.value
    else
      _.set(original, pending.keypath, pending.value)

    await parser.save(filepath, original, Config.sortKeys)
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
  }

  async renameKey (oldkey: string, newkey: string) {
    const edit = new WorkspaceEdit()

    const locations = await Global.loader.analyst.getAllOccurrenceLocations(oldkey)

    for (const location of locations)
      edit.replace(location.uri, location.range, newkey)

    Global.loader.renameKeyInLocales(oldkey, newkey)

    return edit
  }

  async renameKeyInLocales (oldkey: string, newkey: string) {
    const writes = _(this._files)
      .entries()
      .flatMap(([filepath, file]) => {
        const value = _.get(file.value, oldkey)
        if (value === undefined)
          return []
        return [{
          value: undefined,
          keypath: oldkey,
          filepath,
          locale: file.locale,
        }, {
          value: _.get(file.value, oldkey),
          keypath: newkey,
          filepath,
          locale: file.locale,
        }]
      })
      .value()

    if (!writes.length)
      return

    await Global.loader.writeToFile(writes)
  }

  private getFileInfo (filepath: string, dirStructure: 'dir'|'file') {
    const regexp = new RegExp(Config.getMatchRegex(dirStructure), 'ig')
    const filename = path.basename(filepath)
    const ext = path.extname(filepath)
    const match = regexp.exec(filename)
    // Log.info(`\nMatching filename: ${filename} ${JSON.stringify(match)}`)
    if (!match || match.length < 1)
      return

    const info = path.parse(filepath)

    let locale = ''
    let nested = false

    if (dirStructure === 'file') {
      if (!match || match.length < 2)
        return
      if (!match[1]) // filename with no locales code, should be treat as source locale
        locale = Config.sourceLanguage
      else
        locale = normalizeLocale(match[1], '')
    }

    if (dirStructure === 'dir') {
      nested = true
      locale = normalizeLocale(path.basename(info.dir), '')
    }

    if (!locale)
      return

    const parser = Global.getMatchedParser(ext)

    return {
      locale,
      nested,
      parser,
      ext,
    }
  }

  private async loadFile (filepath: string, dirStructure: 'dir'|'file' = 'file', parentPath?: string) {
    try {
      const result = this.getFileInfo(filepath, dirStructure)
      if (!result)
        return
      const { locale, nested, parser } = result
      Log.info(`📑 Loading (${locale}) ${path.relative(parentPath || this.rootpath, filepath)}`, parentPath ? 1 : 0)
      if (!parser)
        throw new AllyError(ErrorType.unsupported_file_type)

      const value = await parser.load(filepath)
      this._files[filepath] = {
        filepath,
        locale,
        value,
        nested,
        readonly: parser.readonly,
      }
    }
    catch (e) {
      this.unsetFile(filepath)
      Log.info(`🐛 Failed to load ${e}`, parentPath ? 2 : 1)
    }
  }

  private unsetFile (filepath: string) {
    delete this._files[filepath]
  }

  private async isDirectory (filepath: string) {
    const stat = await fs.lstat(filepath)
    return stat.isDirectory()
  }

  private async loadDirectory (rootPath: string) {
    const paths = await fs.readdir(rootPath)
    const dirStructure = Config.dirStructure

    for (const filename of paths) {
      const filepath = path.resolve(rootPath, filename)
      const isDirectory = await this.isDirectory(filepath)

      if (['auto', 'file'].includes(dirStructure) && !isDirectory)
        await this.loadFile(filepath, 'file', rootPath)

      if (['auto', 'dir'].includes(dirStructure) && isDirectory) {
        for (const p of await fs.readdir(filepath)) {
          const subfilepath = path.resolve(filepath, p)
          if (!await this.isDirectory(subfilepath))
            await this.loadFile(subfilepath, 'dir', rootPath)
        }
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
    const subTree = (object: object, keypath: string, keyname: string, file: ParsedFile, tree?: LocaleTree, isCollection = false) => {
      tree = tree || new LocaleTree({ keypath, keyname, isCollection })
      tree.values[file.locale] = object
      for (const [key, value] of Object.entries(object)) {
        const newKeyPath = keypath
          ? (isCollection
            ? `${keypath}[${key}]`
            : `${keypath}.${key}`)
          : (isCollection
            ? `[${key}]`
            : key)

        // should go nested
        if (_.isArray(value)) {
          let originalTree: LocaleTree|undefined
          if (tree.getChild(key) && tree.getChild(key).type === 'tree')
            originalTree = tree.getChild(key) as LocaleTree

          tree.setChild(key, subTree(value, newKeyPath, key, file, originalTree, true))
          continue
        }

        if (_.isObject(value)) {
          let originalTree: LocaleTree|undefined
          if (tree.getChild(key) && tree.getChild(key).type === 'tree')
            originalTree = tree.getChild(key) as LocaleTree

          tree.setChild(key, subTree(value, newKeyPath, key, file, originalTree))
          continue
        }

        // init node
        if (!tree.getChild(key)) {
          const node = new LocaleNode({
            keypath: newKeyPath,
            keyname: key,
            readonly: file.readonly,
          })
          tree.setChild(key, node)
          this._flattenLocaleTree[node.keypath] = node
        }

        // add locales to exitsing node
        const node = tree.getChild(key)
        if (node.type === 'node') {
          node.locales[file.locale] = new LocaleRecord({
            keypath: newKeyPath,
            keyname: key,
            value,
            locale: file.locale,
            filepath: file.filepath,
            readonly: file.readonly,
          })
        }
      }
      return tree
    }

    const tree = new LocaleTree({ keypath: '' })
    for (const file of Object.values(this._files))
      subTree(file.value, '', '', file, tree)
    this._localeTree = tree
  }

  private update () {
    this.updateLocalesTree()
    this._onDidChange.fire()
  }

  private async loadAll () {
    let paths: string[] = []
    if (this.localesPaths.length > 0) {
      try {
        paths = await fg(this.localesPaths, {
          cwd: this.rootpath,
          onlyDirectories: true,
        })
      }
      catch (e) {
        Log.error(e)
      }
    }
    if (paths.length === 0)
      Log.info('\n⚠ No locales paths.')

    for (const pathname of paths) {
      try {
        const fullpath = path.resolve(this.rootpath, pathname)
        Log.info(`\n📂 Loading locales under ${fullpath}`)
        await this.loadDirectory(fullpath)
        this.watchOn(fullpath)
      }
      catch (e) {
        Log.error(e)
      }
    }
    Log.info('\n✅ Loading finished')
    Log.divider()
  }
}
