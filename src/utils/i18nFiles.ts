import * as vscode from 'vscode'
import * as path from 'path'
import * as fs from 'fs'
import { set as _Set, get as _Get } from 'lodash'
import { google, baidu, youdao } from 'translation.js'

import lngs from './lngs'
import KeyDetector from './KeyDetector'

interface II18nItem {
  key: string
  transItems: ITransItem[]
}

interface ITransItem {
  i18nRootPath: string
  lng: string
  originLng: string
  path: string
  data: string
}

class I18nFile {
  files = {}
  rootPath = null

  constructor(rootPath) {
    this.rootPath = rootPath
    this.watchChange(rootPath)
  }

  private static normalizeLng(lng) {
    return lngs.reduce((acc, cur) => {
      if (Array.isArray(cur) && cur[1].includes(lng)) {
        acc = cur[0]
      } else if (
        typeof cur === 'string' &&
        acc.toUpperCase() === cur.toUpperCase()
      ) {
        acc = cur
      }

      return acc
    }, lng)
  }

  getLngs() {
    const rootPath = this.rootPath
    const i18nList = fs
      .readdirSync(rootPath)
      .map((pathName: string) => {
        const filePath = path.resolve(rootPath, pathName)
        return {
          rootPath,
          path: fs.lstatSync(filePath).isDirectory() && filePath,
          originLng: pathName,
          lng: I18nFile.normalizeLng(pathName),
        }
      })
      .filter((item: any) => !!item.path)
      .sort(() => 1)

    return i18nList
  }

  watchChange(i18nPath: string) {
    const watcher = vscode.workspace.createFileSystemWatcher(`${i18nPath}/**`)

    const updateFile = (type, { path: filePath }) => {
      const { name, ext } = path.parse(filePath)
      if (ext !== '.json') return

      switch (type) {
        case 'del':
          Reflect.deleteProperty(this.files, name)
          break

        case 'change':
        case 'create':
          this.files[name] = this.readFile(filePath)
          break

        default:
        // do nothing..
      }
    }
    watcher.onDidChange(updateFile.bind(this, 'change'))
    watcher.onDidCreate(updateFile.bind(this, 'create'))
    watcher.onDidDelete(updateFile.bind(this, 'del'))
  }

  readFile(i18nFilePath: string): ITransItem[] {
    const { name } = path.parse(i18nFilePath)
    const result = []
    const lngs = this.getLngs()

    lngs.forEach(lngItem => {
      const filePath = path.join(
        this.rootPath,
        lngItem.originLng,
        `${name}.json`
      )
      const i18nItem = {
        ...lngItem,
        data: {},
      }

      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
        const isObject =
          Reflect.apply(Object.prototype.toString, data, []) ===
          '[object Object]'

        i18nItem.data = isObject ? data : {}
      } catch (err) {
        console.error(err)
      }
      result.push(i18nItem)
    })

    return result
  }

  writeTransByKey(i18nKey: string, transItems: ITransItem[]) {
    const [fileName, ...keyPath] = i18nKey.split('.')
    const curTransItems = this.files[fileName] || []

    transItems.forEach(transItem => {
      const filePath = path.join(transItem.path, `${fileName}.json`)
      const curTransItem =
        curTransItems.find(item => item.lng === transItem.lng) || {}
      const data = curTransItem.data || {}

      _Set(data, keyPath, transItem.data)
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
    })
  }

  getTransByKey(i18nKey: string) {
    const [fileName, ...keyPath] = i18nKey.split('.')

    if (!this.files[fileName]) {
      const filePath = path.join(this.rootPath, `${fileName}.json`)
      this.files[fileName] = this.readFile(filePath)
    }

    return this.files[fileName].map(fileItem => {
      return {
        ...fileItem,
        i18nKey,
        data: keyPath.length ? _Get(fileItem.data, keyPath) : fileItem.data,
      }
    })
  }
}

class I18nFiles {
  i18nFiles = new Map<String, I18nFile>()

  constructor() {
    vscode.workspace
      .getConfiguration('vue-i18n')
      .i18nPaths.forEach(i18nPath => {
        const rootPath = vscode.workspace.workspaceFolders[0].uri.path
        const absI18nPath = path.resolve(rootPath, i18nPath)

        this.i18nFiles.set(absI18nPath, new I18nFile(absI18nPath))
      })
  }

  static getRelativePathByFilePath(filePath: string) {
    const rootPath = vscode.workspace.workspaceFolders[0].uri.path
    const i18nPaths = vscode.workspace.getConfiguration('vue-i18n').i18nPaths

    const i18nRootPath = i18nPaths
      .map((pathItem: string) => path.resolve(rootPath, pathItem))
      .sort((a: string, b: string) =>
        //通过对比哪个更接近来确定符合要求的目录
        path.relative(filePath, a).length > path.relative(filePath, b).length
          ? 1
          : -1
      )[0]

    return i18nRootPath
  }

  async transByApi(params, plans: any[]) {
    const plan = plans.shift()

    try {
      return await plan(params)
    } catch (err) {
      return plans.length
        ? this.transByApi(params, plans)
        : Promise.reject('所有翻译接口都失效了')
    }
  }

  private getI18nFileByPath(filePath: string) {
    const rootPath = I18nFiles.getRelativePathByFilePath(filePath)
    return this.i18nFiles.get(rootPath)
  }

  getTransByApi(transItems: ITransItem[]): Promise<ITransItem[]> {
    const cnItem = transItems.find(transItem => transItem.lng === 'zh-CN')

    const tasks = transItems.map(transItem => {
      if (transItem.lng === 'zh-CN') return transItem

      const plans = [google.translate, baidu.translate, youdao.translate]
      return this.transByApi(
        {
          from: 'zh-CN',
          to: transItem.lng,
          text: cnItem.data,
        },
        plans
      ).then(res => {
        transItem.data = res.result[0] || cnItem.data
        return transItem
      })
    })

    return Promise.all(tasks)
  }

  getTrans(filePath: string, i18nKey?: string) {
    const i18nFile = this.getI18nFileByPath(filePath)

    if (i18nKey) {
      return i18nFile.getTransByKey(i18nKey)
    }

    const keys = KeyDetector.getKeyByFile(filePath)
    return keys.map(key => {
      return {
        key,
        transItems: this.getTrans(filePath, key),
      }
    })
  }

  writeTrans(filePath: string, i18nItem: II18nItem) {
    const i18nFile = this.getI18nFileByPath(filePath)
    i18nFile.writeTransByKey(i18nItem.key, i18nItem.transItems)
  }
}

export default new I18nFiles()
