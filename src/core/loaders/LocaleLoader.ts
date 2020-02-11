import { promises as fs, existsSync } from 'fs'
import * as path from 'path'
import { workspace, window, WorkspaceEdit, RelativePattern } from 'vscode'
import * as fg from 'fast-glob'
import _, { uniq } from 'lodash'
import { replaceLocalePath, normalizeLocale, Log, applyPendingToObject, unflatten } from '../../utils'
import i18n from '../../i18n'
import { ParsedFile, PendingWrite, DirStructure, DirStructureAuto } from '../types'
import { LocaleTree } from '../Nodes'
import { AllyError, ErrorType } from '../Errors'
import { FulfillAllMissingKeysDelay } from '../../commands/manipulations'
import { Loader } from './Loader'
import { Analyst, Global, Config } from '..'

export class LocaleLoader extends Loader {
  private _files: Record<string, ParsedFile> = {}

  constructor(public readonly rootpath: string) {
    super(`[LOCALE]${rootpath}`)
  }

  async init() {
    Log.info(`🚀 Initializing loader "${this.rootpath}"`)
    await this.loadAll()
    this.update()
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

  private getFilepathsOfLocale(locale: string) {
    return Object.values(this._files)
      .filter(f => f.locale === locale)
      .map(f => f.filepath)
  }

  async requestMissingFilepath(locale: string, keypath: string) {
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

  private _ignoreChanges = false

  async write(pendings: PendingWrite|PendingWrite[]) {
    this._ignoreChanges = true
    if (!Array.isArray(pendings))
      pendings = [pendings]

    pendings = pendings.filter(i => i)

    const distrubtedPendings: Record<string, PendingWrite[]> = {}

    for (const pending of pendings) {
      let filepath = pending.filepath
      if (!filepath)
        filepath = await this.requestMissingFilepath(pending.locale, pending.keypath)
      if (!filepath) {
        Log.info(`💥 Unable to file path for writing ${JSON.stringify(pending)}`)
        continue
      }
      if (!distrubtedPendings[filepath])
        distrubtedPendings[filepath] = []
      distrubtedPendings[filepath].push(pending)
    }

    try {
      for (const [filepath, pendings] of Object.entries(distrubtedPendings)) {
        Log.info(`💾 Writing ${filepath}`)

        const ext = path.extname(filepath)
        const parser = Global.getMatchedParser(ext)
        if (!parser)
          throw new AllyError(ErrorType.unsupported_file_type, ext)

        let original: any = {}
        if (existsSync(filepath)) {
          original = await parser.load(filepath)
          original = this.preprocessData(original, {
            locale: pendings[0].locale,
            targetFile: filepath,
          })
        }

        let modified = original
        for (const pending of pendings)
          modified = applyPendingToObject(modified, pending, await Config.requestKeyStyle())

        modified = this.deprocessData(modified, {
          locale: pendings[0].locale,
          targetFile: filepath,
        })

        await parser.save(filepath, modified, Config.sortKeys)
      }
    }
    catch (e) {
      this._ignoreChanges = false
      throw e
    }
    this._ignoreChanges = false
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

  private getFileInfo(filepath: string, dirStructure: DirStructure, rootPath?: string) {
    const filename = path.basename(filepath)
    const ext = path.extname(filepath)
    const regs = Global.getFilenameMatchRegex(dirStructure)
    let namespace: string| undefined

    let match: RegExpExecArray | null = null
    for (const reg of regs) {
      match = reg.exec(filename)
      if (match && match.length > 0)
        break
    }
    // Log.info(`\nMatching filename: ${filename} ${dirStructure} ${JSON.stringify(match)}`)
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
      locale = rootPath
        ? normalizeLocale(path.relative(rootPath, filepath).split(path.sep)[0], '')
        : normalizeLocale(path.basename(info.dir), '')
      namespace = info.name
    }

    if (!locale)
      return

    const parser = Global.getMatchedParser(ext)

    return {
      locale,
      nested,
      parser,
      ext,
      namespace,
    }
  }

  private async loadFile(filepath: string, dirStructure: DirStructure = 'file', parentPath?: string) {
    try {
      const result = this.getFileInfo(filepath, dirStructure, parentPath)
      if (!result)
        return
      const { locale, nested, parser, namespace } = result
      if (!parser)
        return
      Log.info(`📑 Loading (${locale}) ${path.relative(parentPath || this.rootpath, filepath)}`, parentPath ? 1 : 0)

      let data = await parser.load(filepath)
      data = this.preprocessData(data, { locale, targetFile: filepath })
      const value = unflatten(data)

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
      Log.info(`🐛 Failed to load ${e}`, parentPath ? 2 : 1)
    }
  }

  private unsetFile(filepath: string) {
    delete this._files[filepath]
  }

  private async isDirectory(filepath: string) {
    const stat = await fs.lstat(filepath)
    return stat.isDirectory()
  }

  private async loadDirectory(searchingPath: string, dirStructure: DirStructureAuto, rootPath?: string) {
    rootPath = rootPath || searchingPath
    const paths = await fs.readdir(searchingPath)

    for (const filename of paths) {
      const filepath = path.resolve(searchingPath, filename)
      const isDirectory = await this.isDirectory(filepath)

      if (['auto', 'file'].includes(dirStructure) && !isDirectory)
        await this.loadFile(filepath, 'file', searchingPath)

      if (['auto', 'dir'].includes(dirStructure) && isDirectory) {
        for (const p of await fs.readdir(filepath)) {
          const subfilepath = path.resolve(filepath, p)
          if (!await this.isDirectory(subfilepath))
            await this.loadFile(subfilepath, 'dir', rootPath)
          else if (Config.includeSubfolders)
            await this.loadDirectory(filepath, 'dir', rootPath)
        }
      }
    }
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

        case 'create':
        case 'change':
          if (related !== base)
            await this.loadFile(filepath, 'dir', rootPath)
          else
            await this.loadFile(filepath)
          this.update()
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

    if (Global.hasFeatureEnabled('namespace')) {
      const namespaces = uniq(this.files.map(f => f.namespace)) as string[]
      const root = new LocaleTree({ keypath: '' })
      for (const ns of namespaces) {
        const files = this.files.filter(f => f.namespace === ns)
        const tree = new LocaleTree({ keypath: ns })
        for (const file of files)
          this.updateTree(tree, file.value, ns, ns, file)
        root.children[ns] = tree
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
    }
    catch (e) {
      Log.error(e)
    }
  }

  private async loadAll(watch = true) {
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
