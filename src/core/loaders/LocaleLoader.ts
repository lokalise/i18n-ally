import path from 'path'
import { workspace, window, WorkspaceEdit, RelativePattern } from 'vscode'
import fg from 'fast-glob'
import _, { uniq, throttle, set } from 'lodash'
import fs from 'fs-extra'
import { findBestMatch } from 'string-similarity'
import { FILEWATCHER_TIMEOUT } from '../../meta'
import { ParsedFile, PendingWrite, DirStructure, TargetPickingStrategy } from '../types'
import { LocaleTree } from '../Nodes'
import { AllyError, ErrorType } from '../Errors'
import { Analyst, Global, Config } from '..'
import { Telemetry, TelemetryKey } from '../Telemetry'
import { Loader } from './Loader'
import { ReplaceLocale, Log, applyPendingToObject, unflatten, NodeHelper, getCache, setCache } from '~/utils'
import i18n from '~/i18n'

const THROTTLE_DELAY = 1500

export class LocaleLoader extends Loader {
  private _files: Record<string, ParsedFile> = {}
  private _path_matchers: {regex: RegExp; matcher: string}[] = []
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

      if (Config._pathMatcher)
        Log.info(`🗃 Custom Path Matcher: ${Config._pathMatcher}`)

      this._path_matchers = Global.getPathMatchers(this._dir_structure)
      Log.info(`🗃 Path Matcher Regex: ${this._path_matchers.map(i => i.regex)}`)
      await this.loadAll()
    }
    this.update()
    Log.divider()
  }

  get localesPaths() {
    return Global.localesPaths
  }

  get files() {
    return Object.values(this._files)
  }

  get locales() {
    // sort by source, display and others by alpha
    const source = Config.sourceLanguage
    const display = Config.displayLanguage
    const allLocales = _(this._files)
      .values()
      .map(f => f.locale)
      .uniq()
      .sort()
      .value()

    const locales = allLocales
      .filter(i => i !== source && i !== display)

    if (allLocales.includes(display))
      locales.unshift(display)

    if (display !== source && allLocales.includes(source))
      locales.unshift(source)

    return locales
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

    const config = Global.dirStructure
    if (config !== 'auto')
      return config

    const dir = this._locale_dirs[0]

    const dirnames = await fg('*', {
      onlyDirectories: true,
      cwd: dir,
      deep: 1,
      ignore: Config.ignoreFiles,
    })

    const total = dirnames.length
    if (total === 0)
      return 'file'

    const positives = dirnames
      .map(d => Config.tagSystem.lookup(d))

    const positive = positives
      .filter(d => d)
      .length

    // if there are some dirs are named as locale code, guess it's dir mode
    return (positive / total) >= POSITIVE_RATE
      ? 'dir'
      : 'file'
  }

  async requestMissingFilepath(pending: PendingWrite) {
    const { locale, keypath } = pending

    // try to match namespaces
    if (Config.namespace) {
      const namespace = pending.namespace || this.getNodeByKey(keypath)?.meta?.namespace

      const filesSameLocale = this.files.find(f => f.namespace === namespace && f.locale === locale)

      if (filesSameLocale)
        return filesSameLocale.filepath

      const fileSource = this.files.find(f => f.namespace === namespace && f.locale === Config.sourceLanguage)
      if (fileSource && fileSource.matcher) {
        const relative = path.relative(fileSource.dirpath, fileSource.filepath)
        const newFilepath = ReplaceLocale(relative, fileSource.matcher, locale, Global.enabledParserExts)
        return path.join(fileSource.dirpath, newFilepath)
      }
    }

    const paths = this.getFilepathsOfLocale(locale)

    if (paths.length === 1)
      return paths[0]

    if (paths.length === 0) {
      return await window.showInputBox({
        prompt: i18n.t('prompt.enter_file_path_to_store_key', keypath),
        placeHolder: `path/to/${locale}.json`,
        ignoreFocusOut: true,
      })
    }
    if (Config.targetPickingStrategy === TargetPickingStrategy.MostSimilar && pending.textFromPath)
      return this.findBestMatchFile(pending.textFromPath, paths)

    if (Config.targetPickingStrategy === TargetPickingStrategy.FilePrevious && pending.textFromPath)
      return this.handleExtractToFilePrevious(pending.textFromPath, paths, keypath)

    if (Config.targetPickingStrategy === TargetPickingStrategy.GlobalPrevious)
      return this.handleExtractToGlobalPrevious(paths, keypath)

    return await this.promptPathToSave(paths, keypath)
  }

  async promptPathToSave(paths: string[], keypath: string) {
    const result = await window.showQuickPick(
      paths.map(i => ({
        label: `$(file) ${path.basename(i)}`,
        description: path.relative(this.rootpath, i),
        path: i,
      })),
      {
        placeHolder: i18n.t('prompt.select_file_to_store_key', keypath),
        ignoreFocusOut: true,
      })

    return result?.path
  }

  /**
   * Extract text to current file's previous selected locale file
   * @param fromPath: path of current extracting file
   * @param paths: paths of locale files
   * @param keypath
   */
  async handleExtractToFilePrevious(fromPath: string, paths: string[], keypath: string): Promise<string | void> {
    const cacheKey = 'perFilePickingTargets'
    const pickingTargets: any = getCache(cacheKey, {})
    const cachedPath = pickingTargets[fromPath]

    if (cachedPath)
      return cachedPath

    const newPath = await this.promptPathToSave(paths, keypath)
    pickingTargets[fromPath] = newPath
    setCache(cacheKey, pickingTargets)

    return newPath
  }

  /**
   * Extract text to previous selected locale file (includes selection made in other files)
   * @param paths: paths of locale files
   * @param keypath
   */
  async handleExtractToGlobalPrevious(paths: any, keypath: string): Promise<string | void> {
    const cacheKey = 'globalPickingTargets'
    const pickingTarget = getCache<string>(cacheKey)

    if (pickingTarget)
      return pickingTarget

    const newPath = await this.promptPathToSave(paths, keypath)

    setCache(cacheKey, newPath)

    return newPath
  }

  findBestMatchFile(fromPath: string, paths: string[]): string {
    return findBestMatch(fromPath, paths).bestMatch.target
  }

  async write(pendings: PendingWrite|PendingWrite[]) {
    if (!Array.isArray(pendings))
      pendings = [pendings]

    pendings = pendings.filter(i => i)

    const distributed: Record<string, PendingWrite[]> = {}

    // distribute pendings writes by files
    for (const pending of pendings) {
      const filepath = pending.filepath || await this.requestMissingFilepath(pending)
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
        if (parser.readonly || Config.readonly)
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
            await Global.requestKeyStyle(),
          )
        }

        const locale = pendings[0].locale

        const processingContext = { locale, targetFile: filepath }
        const processed = this.deprocessData(modified, processingContext)

        await parser.save(filepath, processed, Config.sortKeys)

        if (this._files[filepath]) {
          this._files[filepath].value = modified
          this._files[filepath].mtime = this.getMtime(filepath)
        }
      }
    }
    catch (e) {
      this.update()
      throw e
    }

    this.update()
  }

  canHandleWrites(pending: PendingWrite) {
    return !pending.features?.VueSfc && !pending.features?.FluentVueSfc
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
    let matcher: string | undefined

    for (const r of this._path_matchers) {
      match = r.regex.exec(relativePath)
      if (match && match.length > 0) {
        matcher = r.matcher
        break
      }
    }

    if (!match || match.length < 1)
      return

    let namespace = match.groups?.namespace
    if (namespace)
      namespace = namespace.replace(/\//g, '.')

    let locale = match.groups?.locale
    if (locale)
      locale = Config.normalizeLocale(locale, '')
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
      matcher,
    }
  }

  private async loadFile(dirpath: string, relativePath: string) {
    try {
      const result = this.getFileInfo(dirpath, relativePath)
      if (!result)
        return
      const { locale, parser, namespace, fullpath: filepath, matcher } = result
      if (!parser)
        return
      if (!locale)
        return

      const mtime = this.getMtime(filepath)

      Log.info(`📑 Loading (${locale}) ${relativePath} [${mtime}]`, 1)

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
        matcher,
      }

      return true
    }
    catch (e) {
      this.unsetFile(relativePath)
      Log.info(`🐛 Failed to load ${e}`, 2)
      // eslint-disable-next-line no-console
      console.error(e)
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
        ...Config.ignoreFiles,
      ],
      deep: Config.includeSubfolders ? undefined : 2,
    })

    for (const relative of files)
      await this.loadFile(searchingPath, relative)
  }

  private getMtime(filepath: string) {
    try {
      return fs.statSync(filepath).mtimeMs
    }
    catch {
      return 0
    }
  }

  private getRelativePath(filepath: string) {
    let dirpath = this._locale_dirs.find(dir => filepath.startsWith(dir))
    if (!dirpath)
      return

    let relative = path.relative(dirpath, filepath)

    if (process.platform === 'win32') {
      relative = relative.replace(/\\/g, '/')
      dirpath = dirpath.replace(/\\/g, '/')
    }

    return { dirpath, relative }
  }

  private async onFileChanged(type: string, { fsPath: filepath }: { fsPath: string }) {
    filepath = path.resolve(filepath)

    // not tracking
    if (type !== 'create' && !this._files[filepath])
      return

    // already up-to-date
    if (type !== 'change' && this._files[filepath]?.mtime === this.getMtime(filepath)) {
      Log.info(`🔄 Skipped on loading "${filepath}" (same mtime)`)
      return
    }

    const { dirpath, relative } = this.getRelativePath(filepath) || {}
    if (!dirpath || !relative)
      return

    Log.info(`🔄 File changed (${type}) ${relative}`)

    // full reload if configured
    if (Config.fullReloadOnChanged && ['delete', 'change', 'create'].includes(type)) {
      this.throttledFullReload()
      return
    }

    switch (type) {
      case 'delete':
        delete this._files[filepath]
        this.throttledUpdate()
        break

      case 'create':
      case 'change':
        this.throttledLoadFile(dirpath, relative)
        break
    }
  }

  private async watchOn(rootPath: string) {
    Log.info(`\n👀 Watching change on ${rootPath}`)
    const watcher = workspace.createFileSystemWatcher(
      new RelativePattern(rootPath, '**/*'),
    )

    watcher.onDidChange((e: any) => setTimeout(() => this.onFileChanged('change', e), FILEWATCHER_TIMEOUT), this, this._disposables)
    watcher.onDidCreate((e: any) => setTimeout(() => this.onFileChanged('create', e), FILEWATCHER_TIMEOUT), this, this._disposables)
    watcher.onDidDelete((e: any) => setTimeout(() => this.onFileChanged('delete', e), FILEWATCHER_TIMEOUT), this, this._disposables)

    this._disposables.push(watcher)
  }

  private updateLocalesTree() {
    this._flattenLocaleTree = {}
    const root = new LocaleTree({ keypath: '' })

    if (Global.namespaceEnabled) {
      const namespaces = uniq(this.files.map(f => f.namespace)) as string[]
      for (const ns of namespaces) {
        const files = this.files.filter(f => f.namespace === ns)

        for (const file of files) {
          const value = ns ? set({}, ns, file.value) : file.value
          this.updateTree(root, value, '', '', { ...file, meta: { namespace: file.namespace } })
        }
      }
    }
    else {
      for (const file of Object.values(this._files))
        this.updateTree(root, file.value, '', '', file)
    }
    this._localeTree = root
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
    const localesPaths = this.localesPaths
    if (localesPaths?.length) {
      try {
        const _locale_dirs = await fg(localesPaths, {
          cwd: this.rootpath,
          onlyDirectories: true,
        })

        if (localesPaths.includes('.'))
          _locale_dirs.push('.')

        this._locale_dirs = uniq(
          _locale_dirs
            .map(p => path.resolve(this.rootpath, p)),
        )
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
        if (!this.files.length)
          window.showWarningMessage(i18n.t('prompt.no_locale_loaded'))

        if (this.files.length && this.keys.length)
          Telemetry.track(TelemetryKey.Activated)
      }
      catch (e) {
        Log.error(e)
      }
    }
  }
}
