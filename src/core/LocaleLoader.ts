import { promises as fs } from 'fs'
import { uniq, isObject } from 'lodash'
import * as path from 'path'
import * as flat from 'flat'
import Common from '../utils/Common'
import * as vscode from 'vscode'

export class LocaleRecord {
  constructor (
    public key: string,
    public value: string,
    public locale: string,
    public filepath: string,
  ) {}
}

export interface ParsedFile {
  filepath: string
  locale: string
  value: object
  nested: boolean
  flatten: object
}

export class LocaleNode {
  constructor (
    public key: string,
    public locales: Record<string, LocaleRecord>
  ) {}

  getValue (locale: string, fallback = '') {
    return (this.locales[locale] && this.locales[locale].value) || fallback
  }

  get value () {
    return this.getValue(Common.displayLanguage)
  }
}

export interface FlattenLocaleTree extends Record<string, LocaleNode> {}
export class LocaleTree {
  constructor (
    public keypath: string,
    public keyname: string,
    public children: Record<string, LocaleTree|LocaleNode> = {}
  ) {}
}

export interface Coverage {
  locale: string
  keys: string[]
  translated: number
  total: number
}

export default class LocaleLoader {
  files: Record<string, ParsedFile> = {}
  flattenLocaleTree: FlattenLocaleTree = {}
  localeTree: LocaleTree = new LocaleTree('', 'root')

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

  getTranslationsByKey (key: string): LocaleNode | undefined {
    return this.flattenLocaleTree[key]
  }

  getDisplayingTranslateByKey (key: string): LocaleRecord | undefined {
    const node = this.getTranslationsByKey(key)
    return node && node.locales[Common.displayLanguage]
  }

  private getFileInfo (filepath: string) {
    const info = path.parse(filepath)

    let locale = Common.normalizeLng(info.name, '')
    let nested = false
    if (!locale) {
      nested = true
      locale = Common.normalizeLng(path.basename(info.dir), '')
    }
    if (!locale)
      console.error(`Failed to get locale on file ${filepath}`)

    return {
      locale,
      nested,
    }
  }

  private async loadFile (filepath: string) {
    try {
      console.log('LOADING', filepath)
      const { locale, nested } = this.getFileInfo(filepath)
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
      for (const key of Object.keys(file.flatten)) {
        if (!tree[key])
          tree[key] = new LocaleNode(key, {})

        tree[key].locales[file.locale] = new LocaleRecord(
          key,
          file.flatten[key],
          file.locale,
          file.filepath,
        )
      }
    }
    this.flattenLocaleTree = tree
  }

  private updateLocalesTree () {
    const subTree = (object: object, keypath: string, keyname: string, file: ParsedFile, tree?: LocaleTree) => {
      tree = tree || new LocaleTree(keypath, keyname)
      for (const [key, value] of Object.entries(object)) {
        if (isObject(value)) {
          const originalTree = tree.children[key]
          tree.children[key] = subTree(value, `${keypath}.${key}`, key, file, originalTree instanceof LocaleTree ? originalTree : undefined)
          continue
        }

        if (!tree.children[key])
          tree.children[key] = new LocaleNode(key, {})
        const node = tree.children[key]
        if (node instanceof LocaleNode) {
          node.locales[file.locale] = new LocaleRecord(
            key,
            value,
            file.locale,
            file.filepath,
          )
        }
      }
      return tree
    }

    const tree = new LocaleTree('', 'root')
    for (const file of Object.values(this.files))
      subTree(file.value, '', 'root', file, tree)
    this.localeTree = tree
  }

  private update () {
    this.updateLocalesTree()
    this.updateFlattenLocalesTree()
  }

  private async loadAll () {
    for (const pathname of this.localesPaths) {
      const fullpath = path.resolve(Common.rootPath, pathname)
      await this.loadDirectory(fullpath)
      this.watchOn(fullpath)
    }
  }
}
