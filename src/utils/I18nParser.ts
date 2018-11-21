import * as vscode from 'vscode'
import KeyDetector from './KeyDetector'
import lngs from './lngs'

const lodash = require('lodash')
const path = require('path')
const fs = require('fs')

interface transItem {
  lng: string
  str: string
}

class I18nParser {
  // 基于当前文件名，找到最新的 i18n 文件夹
  static getTransPathByFilePath(filePath: string): string | undefined {
    if (!vscode.workspace.workspaceFolders) return

    const rootPath = vscode.workspace.workspaceFolders[0].uri.path
    const transPaths = vscode.workspace.getConfiguration('vue-i18n').transPaths

    const transPath = transPaths
      .map((pathItem: string) => path.resolve(rootPath, pathItem))
      .sort((a: string, b: string) =>
        //通过对比哪个更接近来确定符合要求的目录
        path.relative(filePath, a).length > path.relative(filePath, b).length
          ? 1
          : -1
      )

    return transPath[0]
  }

  static getTransList(filePath: string): { path: string; name: string }[] {
    const transPath = I18nParser.getTransPathByFilePath(filePath)
    if (!transPath) return []

    const transList = fs
      .readdirSync(transPath)
      .map((item: string) => {
        const filePath = path.resolve(transPath, item)
        return {
          path: fs.lstatSync(filePath).isDirectory() && filePath,
          name: item,
        }
      })
      .filter((item: any) => !!item.path)

    return transList.sort(() => 1)
  }

  static normalizeLng(lng) {
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

  static transByKey(
    key: string,
    filePath: string // 因为可能存在多个项目，所以需要传入当前文件的位置
  ): transItem[] {
    const transList = I18nParser.getTransList(filePath)
    const [lngFileName, ...lngKey] = key.split('.')

    return transList.map(listItem => {
      const lngFilePath = require.resolve(`${listItem.path}/${lngFileName}`)
      delete require.cache[lngFilePath] // 清除之前的缓存
      const lngFile = fs.existsSync(lngFilePath) ? require(lngFilePath) : {}

      return {
        lng: I18nParser.normalizeLng(listItem.name),
        str: lodash.get(lngFile, lngKey),
      }
    })
  }

  static transByFile(filePath: string) {
    const keys = KeyDetector.getKeyByFile(filePath)

    return keys.map(key => {
      return {
        key,
        filePath,
        items: this.transByKey(key, filePath),
      }
    })
  }
}

export default I18nParser
