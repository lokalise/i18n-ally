import { promises as fs } from 'fs'
import { uniq, isObject } from 'lodash'
import * as path from 'path'
import * as flat from 'flat'
import Common from '../utils/Common'

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

export class LocaleTreeNode {
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

export interface FlattenLocaleTree extends Record<string, LocaleTreeNode> {}
export class LocaleTree {
  constructor (
    public keypath: string,
    public keyname: string,
    public children: Record<string, LocaleTree|LocaleTreeNode> = {}
  ) {}
}

export default class LocaleLoader {
  files: Record<string, ParsedFile> = {}
  flattenLocaleTree: FlattenLocaleTree = {}
  localeTree: LocaleTree = new LocaleTree('', 'root')

  get localesPaths () {
    return Common.localesPaths
  }

  get locales () {
    return uniq(Object.values(this.files).map(f => f.locale))
  }

  updateFlattenLocalesTree () {
    const tree: FlattenLocaleTree = {}
    for (const file of Object.values(this.files)) {
      for (const key of Object.keys(file.flatten)) {
        if (!tree[key])
          tree[key] = new LocaleTreeNode(key, {})

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

  updateLocalesTree () {
    const subTree = (object: object, keypath: string, keyname: string, file: ParsedFile, tree?: LocaleTree) => {
      tree = tree || new LocaleTree(keypath, keyname)
      for (const [key, value] of Object.entries(object)) {
        if (isObject(value)) {
          const originalTree = tree.children[key]
          tree.children[key] = subTree(value, `${keypath}.${key}`, key, file, originalTree instanceof LocaleTree ? originalTree : undefined)
          continue
        }

        if (!tree.children[key])
          tree.children[key] = new LocaleTreeNode(key, {})
        const node = tree.children[key]
        if (node instanceof LocaleTreeNode) {
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

  async init () {
    await this.loadAll()
    this.updateLocalesTree()
    this.updateFlattenLocalesTree()
  }

  getTranslationsByKey (key: string): LocaleTreeNode | undefined {
    return this.flattenLocaleTree[key]
  }

  getDisplayingTranslateByKey (key: string): LocaleRecord | undefined {
    const node = this.getTranslationsByKey(key)
    return node && node.locales[Common.displayLanguage]
  }

  private async loadFile (filepath: string, locale: string, nested = false) {
    try {
      console.log('LOADING', filepath)
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
      console.error(e)
    }
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

      const locale = Common.normalizeLng(isDirectory ? filename : path.parse(filename).name, '')

      if (!isDirectory) {
        await this.loadFile(filePath, locale)
      }
      else {
        for (const p of await fs.readdir(filePath))
          await this.loadFile(path.resolve(filePath, p), locale, true)
      }
    }
  }

  async loadAll () {
    for (const pathname of this.localesPaths) {
      const fullpath = path.resolve(Common.rootPath, pathname)
      await this.loadDirectory(fullpath)
    }
  }
}
