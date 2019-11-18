import { promises as fs, existsSync } from 'fs'
import * as path from 'path'
import * as _ from 'lodash'
import * as fg from 'fast-glob'
import { workspace, window, WorkspaceEdit, RelativePattern } from 'vscode'
import { replaceLocalePath, normalizeLocale, Log, applyPendingToObject } from '../../utils'
import i18n from '../../i18n'
import { LocaleTree, ParsedFile, LocaleRecord, PendingWrite } from '../types'
import { AllyError, ErrorType } from '../Errors'
import { Loader } from './Loader'
import { Analyst, Global, Config } from '..'

export class LocaleLoader extends Loader {
  private _files: Record<string, ParsedFile> = {}

  constructor (public readonly rootpath: string) {
    super(`[LOCALE]${rootpath}`)
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

  get files () {
    return Object.values(this._files)
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

  private async writeToSingleFile (pending: PendingWrite) {
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

    original = await applyPendingToObject(original, pending)

    await parser.save(filepath, original, Config.sortKeys)
  }

  private _ignoreChanges = false

  async write (pendings: PendingWrite|PendingWrite[]) {
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

  canHandleWrites (pending: PendingWrite) {
    return !pending.sfc
  }

  async renameKey (oldkey: string, newkey: string) {
    const edit = new WorkspaceEdit()

    const locations = await Analyst.getAllOccurrenceLocations(oldkey)

    for (const location of locations)
      edit.replace(location.uri, location.range, newkey)

    this.renameKeyInLocales(oldkey, newkey)

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

    await this.write(writes)
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

  private async loadDirectory (rootPath: string, dirStructure: 'auto' | 'file'| 'dir') {
    const paths = await fs.readdir(rootPath)

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
          else if (Config.includeSubfolders)
            await this.loadDirectory(subfilepath, 'dir')
        }
      }
    }
  }

  private async watchOn (rootPath: string) {
    Log.info(`\n👀 Watching change on ${rootPath}`)
    const watcher = workspace.createFileSystemWatcher(
      new RelativePattern(
        rootPath,
        '**/*',
      ),
    )

    const updateFile = async (type: string, { fsPath: filepath }: { fsPath: string }) => {
      if (this._ignoreChanges)
        return
      filepath = path.resolve(filepath)
      const { ext, base } = path.parse(filepath)
      const related = path.relative(rootPath, filepath)

      if (!Global.getMatchedParser(ext))
        return

      Log.info(`🐱‍🚀 Update detected <${type}> ${filepath} [${related}]`)

      if (Config.fullReloadOnChanged && ['del', 'change', 'create'].includes(type)) {
        Log.info('🐱‍🚀 Perfroming a full reload')
        await this.loadAll(false)
        this.update()
        return
      }

      switch (type) {
        case 'del':
          delete this._files[filepath]
          this.update()
          break

        case 'change':
        case 'create':
          if (related !== base)
            await this.loadFile(filepath, 'dir', rootPath)
          else
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

    const tree = new LocaleTree({ keypath: '' })
    for (const file of Object.values(this._files))
      this.updateTree(tree, file.value, '', '', file)
    this._localeTree = tree
  }

  private update () {
    try {
      this.updateLocalesTree()
      this._onDidChange.fire(this.name)
    }
    catch (e) {
      Log.error(e)
    }
  }

  private async loadAll (watch = true) {
    this._files = {}
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
        await this.loadDirectory(fullpath, Config.dirStructure)
        if (watch)
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
