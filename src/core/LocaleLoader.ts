import { promises as fs } from 'fs'
import { uniq } from 'lodash'
import * as path from 'path'
import * as flat from 'flat'
import Common from '../utils/Common'

export interface LocaleRecord {
  key: string
  value: string
  locale: string
  filepath: string
}

export interface ParsedFile {
  filepath: string
  locale: string
  value: object
  nested: boolean
  flatten: object
}

export interface LocaleTreeNode {
  key: string
  locales: Record<string, LocaleRecord>
}

export interface LocaleTree extends Record<string, LocaleTreeNode> {}

export default class LocaleLoader {
  files: Record<string, ParsedFile> = {}
  localeTree: LocaleTree = {}

  get localesPaths () {
    return Common.localesPaths
  }

  get locales () {
    return uniq(Object.values(this.files).map(f => f.locale))
  }

  updateLocalesTree () {
    const tree: LocaleTree = {}
    for (const file of Object.values(this.files)) {
      for (const key of Object.keys(file.flatten)) {
        if (!tree[key]) {
          tree[key] = {
            key,
            locales: {},
          }
        }
        tree[key].locales[file.locale] = {
          key,
          value: file.flatten[key],
          locale: file.locale,
          filepath: file.filepath,
        }
      }
    }
    this.localeTree = tree
  }

  async init () {
    await this.loadAll()
    this.updateLocalesTree()
  }

  getTranslationsByKey (key: string): LocaleTreeNode | undefined {
    return this.localeTree[key]
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
      const filePath = path.resolve(rootPath, filename)

      // filename starts with underscore will be ignored
      if (filePath.startsWith('_'))
        return

      const isDirectory = (await fs.lstat(filePath)).isDirectory()

      if (!isDirectory && path.extname(filePath) !== '.json')
        return

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
