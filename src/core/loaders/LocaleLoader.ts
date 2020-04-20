import * as path from 'path'
import fs from 'fs-extra'
import { workspace, window, WorkspaceEdit, RelativePattern } from 'vscode'
import _, { uniq, throttle } from 'lodash'
import * as fg from 'fast-glob'
import { replaceLocalePath, normalizeLocale, Log, applyPendingToObject, unflatten, NodeHelper } from '../../utils'
import i18n from '../../i18n'
import { ParsedFile, PendingWrite, DirStructure } from '../types'
import { LocaleTree } from '../Nodes'
import { AllyError, ErrorType } from '../Errors'
import { FulfillAllMissingKeysDelay } from '../../commands/manipulations'
import { Loader } from './Loader'
import { Analyst, Global, Config } from '..'

const THROTTLE_DELAY = 1500

export class LocaleLoader extends Loader {
  private _files: Record<string, ParsedFile> = {}
  private _path_matchers: RegExp[] = []
  private _dir_structure: DirStructure = 'file'
  private _locale_dirs: string[] = []

  constructor(public readonly rootpath: string) {
    super(`[LOCALE]${rootpath}`)
  }

  async init() {
    if (await this.findLocaleDirs()) {
      Log.info(`🚀 Initializing loader "${this.rootpath}"`)
      this._dir_structure = await this.guessDirStructure()
      Log.info(`📂 Directory structure: ${this._dir_structure}`)

      if (Config.pathMatcher)
        Log.info(`🗃 Custom Path Matcher: ${Config.pathMatcher}`)

      this._path_matchers = Global.getPathMatchers(this._dir_structure)
      Log.info(`🗃 Path Matcher Regex: ${this._path_matchers}`)
      await this.loadAll()
    }
    this.update()
    Log.divider()
  }

  get localesPaths() {
    return Config.localesPaths
  }

  get files() {
    return Object.values(this._files)
  }

  get locales() {
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

  // #region throttled functions
  private throttledFullReload = throttle(async() => {
    Log.info('🔄 Perfroming a full reload', 2)
    await this.loadAll(false)
    this.update()
  }, THROTTLE_DELAY, { leading: true })

  private throttledUpdate = throttle(() => {
    this.update()
  }, THROTTLE_DELAY, { leading: true })

  private throttledLoadFileWaitingList: [string, string][] = []
  private _fileWatcherOnHold = false

  private get fileWatcherOnHold() {
    return this._fileWatcherOnHold
  }

  private set fileWatcherOnHold(v) {
    if (this._fileWatcherOnHold !== v) {
      this._fileWatcherOnHold = v
      if (!v)
        this.throttledLoadFileExecutor()
    }
  }

  private throttledLoadFileExecutor = throttle(async() => {
    const list = this.throttledLoadFileWaitingList
    this.throttledLoadFileWaitingList = []
    if (list.length) {
      let changed = false
      for (const [d, r] of list)
        changed = await this.loadFile(d, r) || changed

      if (changed)
        this.update()
    }
  }, THROTTLE_DELAY, { leading: true })

  private throttledLoadFile = (d: string, r: string) => {
    if (!this.throttledLoadFileWaitingList.find(([a, b]) => a === d && b === r))
      this.throttledLoadFileWaitingList.push([d, r])
    if (!this.fileWatcherOnHold)
      this.throttledLoadFileExecutor()
  }
  // #endregion

  private getFilepathsOfLocale(locale: string) {
    // TODO: maybe shadow options
    return Object.values(this._files)
      .filter(f => f.locale === locale)
      .map(f => f.filepath)
  }

  async guessDirStructure(): Promise<DirStructure> {
    const POSITIVE_RATE = 0.6

    const config = Config.dirStructure
    if (config === 'auto') {
      const dir = this._locale_dirs[0]

      const dirnames = await fg('*', {
        onlyDirectories: true,
        cwd: dir,
        deep: 1,
      })

      const total = dirnames.length
      if (total === 0)
        return 'file'

      const positive = dirnames
        .map(d => normalizeLocale(d, ''))
        .filter(d => d)
        .length

      // if there are some dirs are named as locale code, guess it's dir mode
      return (positive / total) >= POSITIVE_RATE
        ? 'dir'
        : 'file'
    }
    else {
      return config
    }
  }

  async requestMissingFilepath(locale: string, keypath: string) {
    const paths = this.getFilepathsOfLocale(locale)

    // try to match namespaces
    if (Config.namespace) {
      // to find max match
      let maxMatchFile: ParsedFile | undefined
      for (const path of paths) {
        const file = this._files[path]
        if (!file?.namespace)
          continue

        if (keypath.startsWith(`${file.namespace}.`)) {
          if ((maxMatchFile?.namespace?.length || 0) < file.namespace.length)
            maxMatchFile = file
        }
      }

      // return if found
      if (maxMatchFile)
        return maxMatchFile.filepath
    }

    if (paths.length === 1)
      return paths[0]

    if (paths.length === 0) {
      return await window.showInputBox({
        prompt: i18n.t('prompt.enter_file_path_to_store_key'),
        placeHolder: `path/to/${locale}.json`,
        ignoreFocusOut: true,
      })
    }
    else {
      return await window.showQuickPick(paths, {
        placeHolder: i18n.t('prompt.select_file_to_store_key'),
        ignoreFocusOut: true,
      })
    }
  }

  getShadowFilePath(key: string, locale: string) {
    key = this.rewriteKeys(key, 'reference', { locale })
    const paths = this.getFilepathsOfLocale(locale)
    if (paths.length === 1)
      return paths[0]

    const node = this.getNodeByKey(key)
    if (node) {
      const sourceRecord = node.locales[Config.sourceLanguage] || Object.values(node.locales)[0]
      if (sourceRecord && sourceRecord.filepath)
        return replaceLocalePath(sourceRecord.filepath, locale)
    }
    return undefined
  }

  async write(pendings: PendingWrite|PendingWrite[]) {
    this.fileWatcherOnHold = true
    if (!Array.isArray(pendings))
      pendings = [pendings]

    pendings = pendings.filter(i => i)

    const distributed: Record<string, PendingWrite[]> = {}

    // distribute pendings writes by files
    for (const pending of pendings) {
      const filepath = pending.filepath || await this.requestMissingFilepath(pending.locale, pending.keypath)
      if (!filepath) {
        Log.info(`💥 Unable to find path for writing ${JSON.stringify(pending)}`)
        continue
      }

      if (Config.namespace)
        pending.namespace = pending.namespace || this._files[filepath]?.namespace

      if (!distributed[filepath])
        distributed[filepath] = []
      distributed[filepath].push(pending)
    }

    try {
      for (const [filepath, pendings] of Object.entries(distributed)) {
        const ext = path.extname(filepath)
        const parser = Global.getMatchedParser(ext)
        if (!parser)
          throw new AllyError(ErrorType.unsupported_file_type, undefined, ext)
        if (parser.readonly)
          throw new AllyError(ErrorType.write_in_readonly_mode)

        Log.info(`💾 Writing ${filepath}`)

        let original: any = {}
        if (fs.existsSync(filepath)) {
          original = await parser.load(filepath)
          original = this.preprocessData(original, {
            locale: pendings[0].locale,
            targetFile: filepath,
          })
        }

        let modified = original
        for (const pending of pendings) {
          let keypath = pending.keypath

          if (Global.namespaceEnabled) {
            const node = this.getNodeByKey(keypath)
            keypath = NodeHelper.getPathWithoutNamespace(keypath, node, pending.namespace)
          }

          modified = applyPendingToObject(
            modified,
            keypath,
            pending.value,
            await Config.requestKeyStyle(),
          )
        }

        const locale = pendings[0].locale

        modified = this.deprocessData(modified, {
          locale,
          targetFile: filepath,
        })

        await parser.save(filepath, modified, Config.sortKeys)

        if (this._files[filepath]) {
          const { mtimeMs: mtime } = fs.statSync(filepath)
          this._files[filepath].value = modified
          this._files[filepath].mtime = mtime
        }
      }
    }
    catch (e) {
      this.fileWatcherOnHold = false
      throw e
    }
    this.fileWatcherOnHold = false

    this.update()
  }

  canHandleWrites(pending: PendingWrite) {
    return !pending.features?.VueSfc
  }

  async renameKey(oldkey: string, newkey: string) {
    const edit = new WorkspaceEdit()

    oldkey = this.rewriteKeys(oldkey, 'source')
    newkey = this.rewriteKeys(newkey, 'reference')

    const locations = await Analyst.getAllOccurrenceLocations(oldkey)

    for (const location of locations)
      edit.replace(location.uri, location.range, newkey)

    this.renameKeyInLocales(oldkey, newkey)

    return edit
  }

  async renameKeyInLocales(oldkey: string, newkey: string) {
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

  getNamespaceFromFilepath(filepath: string) {
    const file = this._files[filepath]

    if (file)
      return file.namespace
  }

  private getFileInfo(dirpath: string, relativePath: string) {
    const fullpath = path.resolve(dirpath, relativePath)
    const ext = path.extname(relativePath)

    let match: RegExpExecArray | null = null

    for (const reg of this._path_matchers) {
      match = reg.exec(relativePath)
      if (match && match.length > 0)
        break
    }
    // Log.info(`\nMatching filename: ${filename} ${dirStructure} ${JSON.stringify(match)}`)
    if (!match || match.length < 1)
      return

    let namespace = match.groups?.namespace
    if (namespace)
      namespace = namespace.replace(/\//g, '.')

    let locale = match.groups?.locale
    if (locale)
      locale = normalizeLocale(locale, '')
    else
      locale = Config.sourceLanguage

    if (!locale)
      return

    const parser = Global.getMatchedParser(ext)

    return {
      locale,
      parser,
      ext,
      namespace,
      fullpath,
    }
  }

  private async loadFile(dirpath: string, relativePath: string) {
    try {
      const result = this.getFileInfo(dirpath, relativePath)
      if (!result)
        return
      const { locale, parser, namespace, fullpath: filepath } = result
      if (!parser)
        return
      if (!locale)
        return

      const { mtimeMs: mtime } = fs.statSync(filepath)

      if (this._files[filepath]?.mtime === mtime) {
        Log.info(`📑 Skipped loading ${relativePath}, same mtime`, 1)
        return
      }

      Log.info(`📑 Loading (${locale}) ${relativePath}`, 1)

      let data = await parser.load(filepath)

      data = this.preprocessData(data, { locale, targetFile: filepath })

      const value = Config.disablePathParsing
        ? data
        : unflatten(data)

      this._files[filepath] = {
        filepath,
        dirpath,
        locale,
        value,
        mtime,
        namespace,
        readonly: parser.readonly || Config.readonly,
      }

      return true
    }
    catch (e) {
      this.unsetFile(relativePath)
      Log.info(`🐛 Failed to load ${e}`, 2)
    }
  }

  private unsetFile(filepath: string) {
    delete this._files[filepath]
  }

  private async loadDirectory(searchingPath: string) {
    const files = await fg('**/*.*', {
      cwd: searchingPath,
      onlyFiles: true,
      ignore: [
        'node_modules/**',
        'vendors/**',
      ],
      deep: Config.includeSubfolders ? undefined : 2,
    })

    for (const relative of files)
      await this.loadFile(searchingPath, relative)
  }

  private async watchOn(rootPath: string) {
    Log.info(`\n👀 Watching change on ${rootPath}`)
    const watcher = workspace.createFileSystemWatcher(
      new RelativePattern(
        rootPath,
        '**/*',
      ),
    )

    const updateFile = async(type: string, { fsPath: filepath }: { fsPath: string }) => {
      filepath = path.resolve(filepath)

      if (type !== 'create' && !this._files[filepath])
        return

      const { ext } = path.parse(filepath)

      if (!Global.getMatchedParser(ext))
        return

      let dirpath = this._locale_dirs.find(dir => filepath.startsWith(dir))
      if (!dirpath)
        return

      let relative = path.relative(dirpath, filepath)

      if (process.platform === 'win32') {
        relative = relative.replace(/\\/g, '/')
        dirpath = dirpath.replace(/\\/g, '/')
      }

      Log.info(`🔄 File changed (${type}) ${relative}`)

      if (Config.fullReloadOnChanged && ['del', 'change', 'create'].includes(type)) {
        this.throttledFullReload()
        return
      }

      switch (type) {
        case 'del':
          delete this._files[filepath]
          this.throttledUpdate()
          break

        case 'create':
        case 'change':
          this.throttledLoadFile(dirpath, relative)
          break
      }

      if (type === 'create' && Config.keepFulfilled)
        FulfillAllMissingKeysDelay()
    }
    watcher.onDidChange(updateFile.bind(this, 'change'))
    watcher.onDidCreate(updateFile.bind(this, 'create'))
    watcher.onDidDelete(updateFile.bind(this, 'del'))

    this._disposables.push(watcher)
  }

  private updateLocalesTree() {
    this._flattenLocaleTree = {}

    if (Global.namespaceEnabled) {
      const namespaces = uniq(this.files.map(f => f.namespace)) as string[]
      const root = new LocaleTree({ keypath: '' })
      for (const ns of namespaces) {
        const files = this.files.filter(f => f.namespace === ns)

        const tree = ns
          ? new LocaleTree({ keypath: ns })
          : root // no namespace, put it in the root

        for (const file of files)
          this.updateTree(tree, file.value, ns || '', ns || '', { ...file, meta: { namespace: file.namespace } })

        if ((tree !== root) && ns) {
          const parts = ns.split('.')
          let parent = root
          for (const n of parts.slice(0, -1)) {
            if (!parent.children[n])
              parent.children[n] = new LocaleTree({ keypath: ns, keyname: n })
            parent = parent.children[n] as LocaleTree
          }
          parent.children[parts[parts.length - 1]] = tree
        }
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

  private update() {
    try {
      this.updateLocalesTree()
      this._onDidChange.fire(this.name)
      Log.info('✅ Loading finished\n')
    }
    catch (e) {
      Log.error(e)
    }
  }

  private async findLocaleDirs() {
    this._files = {}
    this._locale_dirs = []
    if (this.localesPaths.length > 0) {
      try {
        this._locale_dirs = await fg(this.localesPaths, {
          cwd: this.rootpath,
          onlyDirectories: true,
        })

        this._locale_dirs = this._locale_dirs
          .map(p => path.resolve(this.rootpath, p))
      }
      catch (e) {
        Log.error(e)
      }
    }

    if (this._locale_dirs.length === 0) {
      Log.info('\n⚠ No locales paths.')
      return false
    }

    return true
  }

  private async loadAll(watch = true) {
    for (const pathname of this._locale_dirs) {
      try {
        Log.info(`\n📂 Loading locales under ${pathname}`)
        await this.loadDirectory(pathname)
        if (watch)
          this.watchOn(pathname)
      }
      catch (e) {
        Log.error(e)
      }
    }
  }
}
