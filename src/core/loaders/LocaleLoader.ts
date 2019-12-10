import { promises as fs, existsSync } from 'fs'
import * as path from 'path'
import * as fg from 'fast-glob'
import { workspace, window, WorkspaceEdit, RelativePattern } from 'vscode'
import _, { uniq } from 'lodash'
import { unflattenObject, replaceLocalePath, normalizeLocale, Log, applyPendingToObject } from '../../utils'
import i18n from '../../i18n'
import { LocaleTree, ParsedFile, LocaleRecord, PendingWrite, DirStructure } from '../types'
import { AllyError, ErrorType } from '../Errors'
import { Loader } from './Loader'
import { Analyst, Global, Config } from '..'

export class LocaleLoader extends Loader {
  private _files: Record<string, ParsedFile> = {}
  dirStructure: DirStructure = 'file'

  constructor (public readonly rootpath: string) {
    super(`[LOCALE]${rootpath}`)
  }

  async init () {
    Log.info(`🚀 Initializing loader "${this.rootpath}"`)
    await this.loadAll()
    this.update()
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
    const pathesToSelect = paths.map(p => ({
      label: path.relative(Global.rootpath, p),
      path: p,
    }))
    const result = await window.showQuickPick(pathesToSelect, {
      placeHolder: i18n.t('prompt.select_file_to_store_key'),
      ignoreFocusOut: true,
    })
    return result?.path
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
    let keypath = pending.keypath
    if (Global.usingNamespace && filepath)
      keypath = this.splitKeypath(keypath).slice(1).join('.')

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

    original = await applyPendingToObject(original, keypath, pending.value)

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
    return !pending.features?.VueSfc
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

  private getFileInfo (root: string, filepath: string) {
    const info = path.parse(filepath)
    const parser = Global.getMatchedParser(info.ext)

    if (!parser)
      return

    const regs = Global.getFilenameMatchRegex(this.dirStructure)

    let match: RegExpExecArray | null = null
    for (const reg of regs) {
      console.log(reg.source)
      console.log(info.base)
      match = reg.exec(info.base)
      if (match && match.length > 0)
        break
    }
    if (!match || match.length < 1)
      return

    let locale = ''
    let nested = false
    let namespace: string | undefined

    if (this.dirStructure === 'file') {
      if (!match || match.length < 2)
        return
      if (!match[1]) // filename with no locales code, should be treat as source locale
        locale = Config.sourceLanguage
      else
        locale = normalizeLocale(match[1], '')
    }

    if (this.dirStructure === 'dir') {
      const parts = path.relative(root, filepath).split(path.sep)
      nested = true
      locale = normalizeLocale(parts[0], '')
      namespace = [...parts.slice(1, -1), info.name].join('.')
    }

    if (!locale)
      return

    return {
      locale,
      nested,
      parser,
      ext: info.ext,
      namespace,
    }
  }

  private async loadFile (rootPath: string, subpath?: string) {
    const filepath = subpath ? path.join(rootPath, subpath) : rootPath

    try {
      const result = this.getFileInfo(rootPath, filepath)
      if (!result)
        return
      const { locale, nested, parser, namespace } = result
      Log.info(`📑 Loading (${locale}) <${namespace}> ${subpath}`, subpath ? 1 : 0)
      if (!parser)
        throw new AllyError(ErrorType.unsupported_file_type)

      const data = await parser.load(filepath)
      const value = unflattenObject(data)

      this._files[filepath] = {
        filepath,
        locale,
        value,
        nested,
        namespace,
        readonly: parser.readonly,
      }
    }
    catch (e) {
      this.unsetFile(filepath)
      Log.info(`🐛 Failed to load ${e}`, subpath ? 2 : 1)
    }
  }

  private unsetFile (filepath: string) {
    delete this._files[filepath]
  }

  private async isDirectory (filepath: string) {
    const stat = await fs.lstat(filepath)
    return stat.isDirectory()
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
            await this.loadFile(filepath)
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

  get usingNamespace () {
    return Global.usingNamespace && this.dirStructure === 'dir'
  }

  private updateLocalesTree () {
    this._flattenLocaleTree = {}

    if (this.usingNamespace) {
      const namespaces = uniq(Object.values(this._files).map(f => f.namespace).filter(i => i)) as string[]
      const root = new LocaleTree({ keypath: '' })
      for (const namespace of namespaces) {
        const files = Object.values(this._files).filter(f => f.namespace === namespace)
        const tree = new LocaleTree({ keypath: namespace })
        for (const file of files)
          this.updateTree(tree, file.value, namespace, namespace, file)
        root.children[namespace] = tree
      }
      this._localeTree = root
    }

    else {
      const tree = new LocaleTree({ keypath: '' })
      for (const file of Object.values(this._files))
        this.updateTree(tree, file.value, '', '', file)
      this._localeTree = tree
    }
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

  private async detectDirStructure (root: string, files: string[]): Promise<DirStructure> {
    if (Config.dirStructure !== 'auto')
      return Config.dirStructure

    for (const filename of files) {
      const filepath = path.resolve(root, filename)
      const isDirectory = await this.isDirectory(filepath)
      if (isDirectory)
        return 'dir'
    }
    return 'file'
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

    let dirStructure: DirStructure = 'file'
    for (const dirname of paths) {
      try {
        const dirpath = path.resolve(this.rootpath, dirname)
        const files = await fs.readdir(dirpath)
        dirStructure = await this.detectDirStructure(dirpath, files)
        if (dirStructure === 'dir')
          break
      }
      catch (e) {
        Log.error(e)
      }
    }
    this.dirStructure = dirStructure
    Log.info(`📂 Loading as "${dirStructure}" structure`)
    if (this.usingNamespace)
      Log.info('🗄 Namespace support enabled')

    for (const dirname of paths) {
      try {
        const dirpath = path.resolve(this.rootpath, dirname)
        Log.info(`\n📂 Loading locales under ${dirpath}`)

        const localeFiles = await fg('**/**/*.*', {
          cwd: dirpath,
          onlyFiles: true,
        })

        for (const filepath of localeFiles)
          await this.loadFile(path.join(this.rootpath, dirname), filepath)

        if (watch)
          this.watchOn(dirname)
      }
      catch (e) {
        Log.error(e)
      }
    }

    Log.info('\n✅ Loading finished')
    Log.divider()
  }
}
