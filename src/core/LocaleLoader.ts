import { promises as fs, existsSync } from 'fs'
import { uniq, isObject, set } from 'lodash'
import * as path from 'path'
import * as flat from 'flat'
import * as vscode from 'vscode'
import { Common } from './Common'
import EventHandler from './EventHandler'
import { MachinTranslate } from './MachineTranslate'
import { getKeyname, getFileInfo, replaceLocalePath } from './utils'
import { LocaleTree, LocaleLoaderEventType, ParsedFile, FlattenLocaleTree, Coverage, LocaleNode, LocaleRecord, PendingWrite } from './types'
import { AllyError, ErrorType } from './Errors'

function newTree (keypath = ''): LocaleTree {
  return {
    keypath,
    keyname: getKeyname(keypath),
    children: {},
    type: 'tree',
  }
}

export class LocaleLoader extends EventHandler<LocaleLoaderEventType> {
  files: Record<string, ParsedFile> = {}
  flattenLocaleTree: FlattenLocaleTree = {}
  localeTree: LocaleTree = newTree()

  async init () {
    await this.loadAll()
    this.update()
  }

  get localesPaths () {
    return Common.localesPaths
  }

  get locales () {
    return uniq(Object.values(this.files).map(f => f.locale))
  }

  getCoverage (locale: string, keys?: string[]): Coverage {
    keys = keys || Object.keys(this.flattenLocaleTree)
    const total = keys.length
    const translated = keys.filter(key => {
      return this.flattenLocaleTree[key] && this.flattenLocaleTree[key].getValue(locale)
    })
    return {
      locale,
      total,
      translated: translated.length,
      keys,
    }
  }

  getTranslationsByKey (keypath: string): LocaleNode | undefined {
    return this.flattenLocaleTree[keypath]
  }

  getTreeNodeByKey (keypath: string, tree?: LocaleTree): LocaleNode | LocaleTree | undefined {
    tree = tree || this.localeTree
    const keys = keypath.split('.')
    const root = keys[0]
    const remaining = keys.slice(1).join('.')
    const node = tree.children[root]
    if (!remaining)
      return node
    if (node && node.type === 'tree')
      return this.getTreeNodeByKey(remaining, node)
    return undefined
  }

  getDisplayingTranslateByKey (key: string): LocaleRecord | undefined {
    const node = this.getTranslationsByKey(key)
    return node && node.locales[Common.displayLanguage]
  }

  private async MachineTranslateRecord (record: LocaleRecord, sourceLanguage: string): Promise<PendingWrite|undefined> {
    if (record.locale === sourceLanguage)
      throw new AllyError(ErrorType.translating_same_locale)
    const sourceNode = this.getTranslationsByKey(record.keypath)
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

    return pendings
  }

  async MachineTranslate (node: LocaleNode| LocaleRecord, sourceLanguage?: string) {
    sourceLanguage = sourceLanguage || Common.sourceLanguage
    if (node.type === 'node')
      return await this.MachineTranslateNode(node, sourceLanguage)

    const pending = await this.MachineTranslateRecord(node, sourceLanguage)

    return [pending]
  }

  getShadowFilePath (keypath: string, locale: string) {
    const node = this.getTranslationsByKey(keypath)
    if (node) {
      const sourceRecord = node.locales[Common.sourceLanguage] || Object.values(node.locales)[0]
      if (sourceRecord)
        return replaceLocalePath(sourceRecord.filepath, locale)
    }

    // FIXME: trace up to guess
    return 'unknown'
  }

  getShadowLocales (node: LocaleNode) {
    const locales: Record<string, LocaleRecord> = {}
    this.locales.forEach(locale => {
      if (node.locales[locale]) { locales[locale] = node.locales[locale] }
      else {
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
    console.log('WRITNING', JSON.stringify(pending))
    let original: object = {}
    if (existsSync(pending.filepath)) {
      const originalRaw = await fs.readFile(pending.filepath, 'utf-8')
      original = JSON.parse(originalRaw)
    }
    set(original, pending.keypath, pending.value)
    const writting = `${JSON.stringify(original, null, 2)}\n`
    await fs.writeFile(pending.filepath, writting, 'utf-8')
  }

  async writeToFile (pendings: PendingWrite|PendingWrite[]) {
    if (!Array.isArray(pendings))
      pendings = [pendings]
    pendings = pendings.filter(i => i)
    for (const pending of pendings)
      await this.writeToSingleFile(pending)
  }

  private async loadFile (filepath: string) {
    try {
      console.log('LOADING', filepath)
      const { locale, nested } = getFileInfo(filepath)
      const raw = await fs.readFile(filepath, 'utf-8')
      const value = JSON.parse(raw)
      this.files[filepath] = {
        filepath,
        locale,
        value,
        nested,
        flatten: flat(value),
      }
    }
    catch (e) {
      this.unsetFile(filepath)
      console.error(e)
    }
  }

  private unsetFile (filepath: string) {
    delete this.files[filepath]
  }

  private async loadDirectory (rootPath: string) {
    const paths = await fs.readdir(rootPath)
    for (const filename of paths) {
      // filename starts with underscore will be ignored
      if (filename.startsWith('_'))
        continue

      const filePath = path.resolve(rootPath, filename)
      const isDirectory = (await fs.lstat(filePath)).isDirectory()

      if (!isDirectory && path.extname(filePath) !== '.json')
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
    const watcher = vscode.workspace.createFileSystemWatcher(`${rootPath}/**`)

    const updateFile = async (type: string, { fsPath: filepath }: { fsPath: string }) => {
      filepath = path.resolve(filepath)
      const { ext } = path.parse(filepath)
      if (ext !== '.json') return

      switch (type) {
        case 'del':
          delete this.files[filepath]
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
  }

  private updateFlattenLocalesTree () {
    const tree: FlattenLocaleTree = {}
    for (const file of Object.values(this.files)) {
      for (const keypath of Object.keys(file.flatten)) {
        if (!tree[keypath])
          tree[keypath] = new LocaleNode(keypath)

        tree[keypath].locales[file.locale] = {
          keypath,
          keyname: getKeyname(keypath),
          value: file.flatten[keypath],
          locale: file.locale,
          filepath: file.filepath,
          type: 'record',
        }
      }
    }
    this.flattenLocaleTree = tree
  }

  private updateLocalesTree () {
    const subTree = (object: object, keypath: string, file: ParsedFile, tree?: LocaleTree) => {
      tree = tree || newTree(keypath)
      for (const [key, value] of Object.entries(object)) {
        const newKeyPath = keypath ? `${keypath}.${key}` : key

        if (isObject(value)) {
          let originalTree: LocaleTree|undefined
          if (tree.children[key] && tree.children[key].type === 'tree')
            originalTree = tree.children[key] as LocaleTree

          tree.children[key] = subTree(value, newKeyPath, file, originalTree)
          continue
        }

        if (!tree.children[key])
          tree.children[key] = new LocaleNode(newKeyPath)
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
    for (const file of Object.values(this.files))
      subTree(file.value, '', file, tree)
    this.localeTree = tree
  }

  private update () {
    this.updateLocalesTree()
    this.updateFlattenLocalesTree()
    this.dispatchEvent('changed')
  }

  private async loadAll () {
    for (const pathname of this.localesPaths) {
      const fullpath = path.resolve(Common.rootPath, pathname)
      await this.loadDirectory(fullpath)
      this.watchOn(fullpath)
    }
  }
}
