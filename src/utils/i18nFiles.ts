import * as vscode from 'vscode'
import * as path from 'path'
import { set as _Set, get as _Get } from 'lodash'
import { google, baidu, youdao } from 'translation.js'

import KeyDetector from './KeyDetector'
import Common from './Common'
import I18nFile, { ITransItem, II18nItem } from './i18nFile'

class I18nFiles {
  private i18nBox = new Map<String, I18nFile>()

  get i18nFiles() {
    Common.i18nPaths.forEach(i18nPath => {
      const rootPath = vscode.workspace.workspaceFolders[0].uri.fsPath
      const absI18nPath = path.resolve(rootPath, i18nPath)

      if (this.i18nBox.has(absI18nPath)) return

      this.i18nBox.set(absI18nPath, new I18nFile(absI18nPath))
    })

    return this.i18nBox
  }

  constructor() {
    Common.i18nPaths.forEach(i18nPath => {
      const rootPath = vscode.workspace.workspaceFolders[0].uri.fsPath
      const absI18nPath = path.resolve(rootPath, i18nPath)

      this.i18nFiles.set(absI18nPath, new I18nFile(absI18nPath))
    })
  }

  static getRelativePathByFilePath(filePath: string) {
    const rootPath = vscode.workspace.workspaceFolders[0].uri.fsPath
    const i18nPaths = Common.i18nPaths

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

  public getI18nFileByPath(filePath: string) {
    const rootPath = I18nFiles.getRelativePathByFilePath(filePath)
    return this.i18nFiles.get(rootPath)
  }

  getTransByApi(transItems: ITransItem[]): Promise<ITransItem[]> {
    const sourceLocale =  Common.getSourceLocale()
    const cnItem = transItems.find(transItem => transItem.lng === sourceLocale)

    const tasks = transItems.map(transItem => {

      if (transItem.lng === sourceLocale) return transItem

      const plans = [google.translate, baidu.translate, youdao.translate]
      return this.transByApi(
        {
          from: sourceLocale,
          to: transItem.lng,
          text: cnItem.data
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

    if (!i18nFile) {
      return
    }

    if (i18nKey) {
      return i18nFile.getTransByKey(i18nKey)
    }

    const keys = KeyDetector.getKeyByFile(filePath)
    return keys.map(key => {
      return {
        key,
        transItems: this.getTrans(filePath, key)
      }
    })
  }

  writeTrans(filePath: string, i18nItem: II18nItem) {
    const i18nFile = this.getI18nFileByPath(filePath)
    i18nFile.writeTransByKey(i18nItem.key, i18nItem.transItems)
  }
}

export default new I18nFiles()
