import * as path from 'path'
import { google, baidu, youdao } from 'translation.js'

import KeyDetector from './KeyDetector'
import Common from './Common'
import I18nFile, { LocaleValue, KeyLocales } from './i18nFile'
import { TranslateResult, StringOrTranslateOptions } from 'translation.js/declaration/api/types'

class I18nFiles {
  private i18nBox = new Map<string, I18nFile>()

  get i18nFiles () {
    Common.localesPaths.forEach(i18nPath => {
      const rootPath = Common.rootPath
      const absI18nPath = path.resolve(rootPath, i18nPath)

      if (this.i18nBox.has(absI18nPath)) return

      this.i18nBox.set(absI18nPath, new I18nFile(absI18nPath))
    })

    return this.i18nBox
  }

  constructor () {
    Common.localesPaths.forEach(i18nPath => {
      const rootPath = Common.rootPath
      const absI18nPath = path.resolve(rootPath, i18nPath)

      this.i18nFiles.set(absI18nPath, new I18nFile(absI18nPath))
    })
  }

  static getRelativePathByFilePath (filePath: string) {
    const rootPath = Common.rootPath
    const localesPaths = Common.localesPaths

    const i18nRootPath = localesPaths
      .map((pathItem: string) => path.resolve(rootPath, pathItem))
      .sort((a: string, b: string) =>
        // 通过对比哪个更接近来确定符合要求的目录
        path.relative(filePath, a).length > path.relative(filePath, b).length
          ? 1
          : -1
      )[0]

    return i18nRootPath
  }

  async transByApi (
    params: StringOrTranslateOptions,
    plans: ((options: StringOrTranslateOptions) => Promise<TranslateResult>)[]
  ): Promise<TranslateResult> {
    const plan = plans.shift()

    if (!plan)
      throw new Error('所有翻译接口都失效了')

    try {
      return await plan(params)
    }
    catch (err) {
      return await this.transByApi(params, plans)
    }
  }

  public getI18nFileByPath (filePath: string) {
    const rootPath = I18nFiles.getRelativePathByFilePath(filePath)
    return this.i18nFiles.get(rootPath)
  }

  getTransByApi (transItems: LocaleValue[], locales?: string | string[], override = false): Promise<LocaleValue[]> {
    const sourceLanguage = Common.sourceLanguage
    const sourceItem = transItems.find(transItem => transItem.lng === sourceLanguage)

    if (!sourceItem)
      return Promise.resolve(transItems)

    if (typeof locales === 'string')
      locales = [locales]

    const tasks = transItems.map(transItem => {
      if (transItem.lng === sourceLanguage) return transItem

      // Only tranlate specific locales, if set
      if (locales && !locales.includes(transItem.lng)) return transItem

      // Skip fields already have data
      if (!override && transItem.data) return transItem

      const plans = [
        google.translate,
        baidu.translate,
        youdao.translate,
      ]
      return this.transByApi(
        {
          from: sourceLanguage,
          to: transItem.lng,
          text: sourceItem.data,
        },
        plans
      ).then(res => {
        transItem.data = res.result[0] || ''
        return transItem
      })
    })

    return Promise.all(tasks)
  }

  getTransByKey (filePath: string, i18nKey: string) {
    const i18nFile = this.getI18nFileByPath(filePath)

    if (!i18nFile)
      return

    return i18nFile.getTransByKey(i18nKey)
  }

  getTrans (filePath: string) {
    const i18nFile = this.getI18nFileByPath(filePath)

    if (!i18nFile)
      return

    const keys = KeyDetector.getKeyByFile(filePath)
    return keys.map(key => {
      return {
        key,
        transItems: this.getTransByKey(filePath, key),
      }
    })
  }

  writeTrans (filePath: string, keylocales: KeyLocales) {
    const i18nFile = this.getI18nFileByPath(filePath)
    i18nFile.writeTransByKey(keylocales.key, keylocales.transItems)
  }
}

export default new I18nFiles()
