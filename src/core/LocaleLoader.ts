import { promises as fs } from 'fs'
import { uniq, isObject, get } from 'lodash'
import * as path from 'path'
import * as flat from 'flat'
import Common from '../utils/Common'
import * as vscode from 'vscode'
import EventHandler from '../utils/EventHandler'

export interface ParsedFile {
  filepath: string
  locale: string
  value: object
  nested: boolean
  flatten: object
}

export interface LocaleRecord {
  keypath: string
  keyname: string
  value: string
  locale: string
  filepath: string
  type: 'record'
}

export interface FlattenLocaleTree extends Record<string, LocaleNode> {}
export interface LocaleTree {
  keypath: string
  keyname: string
  children: Record<string, LocaleTree|LocaleNode>
  type: 'tree'
}

function getKeyname (keypath: string) {
  const keys = keypath.split(/\./g)
  if (!keys.length)
    return ''
  return keys[keys.length - 1]
}

function newTree (keypath = ''): LocaleTree {
  return {
    keypath,
    keyname: getKeyname(keypath),
    children: {},
    type: 'tree',
  }
}

export class LocaleNode {
  keyname: string
  type: 'node' = 'node'

  constructor (
    public keypath: string,
    public locales: Record<string, LocaleRecord> = {}
  ) {
    this.keyname = getKeyname(keypath)
  }

  getValue (locale: string, fallback = '') {
    return (this.locales[locale] && this.locales[locale].value) || fallback
  }

  get value () {
    return this.getValue(Common.displayLanguage)
  }
}

export interface Coverage {
  locale: string
  keys: string[]
  translated: number
  total: number
}

export type LocaleLoaderEventType =
  | 'changed'

export default class LocaleLoader extends EventHandler<LocaleLoaderEventType> {
  files: Record<string, ParsedFile> = {}
  flattenLocaleTree: FlattenLocaleTree = {}
  localeTree: LocaleTree = newTree()

  async init () {
    await this.loadAll()
    this.update()

    console.log(JSON.stringify(this.files, null, 2))
    console.log(JSON.stringify(this.localeTree, null, 2))
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

  getTreeNodeByKey (key: string): LocaleNode | LocaleTree | undefined {
    return get(this.localeTree, key)
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
            keypath,
            keyname: getKeyname(keypath),
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
