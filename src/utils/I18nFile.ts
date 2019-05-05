import * as vscode from 'vscode'
import * as path from 'path'
import * as fs from 'fs'
import { set, get } from 'lodash'

import Common from './common';

export interface II18nItem {
  key: string
  transItems: ITransItem[]
}

export interface ITransItem {
  rootPath: string
  lng: string
  path: string
  data: string
  isDirectory: boolean
  i18nKey?: string
}

class I18nFile {
  files = {}
  rootPath = null

  constructor(rootPath) {
    this.rootPath = rootPath
    this.watchChange(rootPath)
  }

  getLngs() {
    const rootPath = this.rootPath
    const i18nList = fs
      .readdirSync(rootPath)
      .map((pathName: string) => {
        const filePath = path.resolve(rootPath, pathName)
        const isDirectory = fs.lstatSync(filePath).isDirectory()
        const originLng = isDirectory ? pathName : path.parse(pathName).name
        return {
          rootPath,
          path: filePath,
          isDirectory,
          lng: Common.normalizeLng(originLng)
        }
      })
      .filter((item: any) => !!item.lng)
      .sort(item => {
        return item.lng === Common.getSourceLocale() ? -1 : 1
      })

    return i18nList
  }

  private watchChange(i18nPath: string) {
    const watcher = vscode.workspace.createFileSystemWatcher(`${i18nPath}/**`)

    const updateFile = (type, { path: filePath }) => {
      const { ext } = path.parse(filePath)
      if (ext !== '.json') return

      switch (type) {
        case 'del':
          Reflect.deleteProperty(this.files, filePath)
          break

        case 'change':
        case 'create':
          this.files[filePath] = this.readFile(filePath)
          break

        default:
        // do nothing..
      }
    }
    watcher.onDidChange(updateFile.bind(this, 'change'))
    watcher.onDidCreate(updateFile.bind(this, 'create'))
    watcher.onDidDelete(updateFile.bind(this, 'del'))
  }

  getLngFilesByKey(i18nKey: string) {
    return this.getLngs().map(lngItem => {
      if (lngItem.isDirectory) {
        const [fileName] = i18nKey.split('.')
        return {
          ...lngItem,
          path: path.join(lngItem.path, `${fileName}.json`)
        }
      }

      return lngItem
    })
  }

  readFile(i18nFilePath: string) {
    try {
      const data = JSON.parse(fs.readFileSync(i18nFilePath, 'utf-8'))
      const isObject =
        Reflect.apply(Object.prototype.toString, data, []) ===
        '[object Object]'

      return isObject ? data : {}
    } catch (err) {
      return {}
    }
  }

  writeTransByKey(i18nKey: string, transItems: ITransItem[]) {
    const writeFileAll = transItems.map(transItem => {
      return new Promise((resolve, reject) => {
        const data = this.files[transItem.path]
        const [, ...keyPath] = i18nKey.split('.')

        set(data, transItem.isDirectory ? keyPath : i18nKey, transItem.data)
        fs.writeFile(transItem.path, JSON.stringify(data, null, 2), resolve)
      })
    })

    return Promise.all(writeFileAll)
  }

  getTransByKey(i18nKey: string) {
    const result = this.getLngFilesByKey(i18nKey).map(item => {
      if (!this.files[item.path]) {
        this.files[item.path] = this.readFile(item.path)
      }

      const data = this.files[item.path]
      const [, ...keyPath] = i18nKey.split('.')

      return {
        ...item,
        i18nKey,
        data: get(data, item.isDirectory ? keyPath : i18nKey)
      }
    })

    return result
  }
}

export default I18nFile
