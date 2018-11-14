import * as vscode from 'vscode'

const lodash = require('lodash')
const path = require('path')
const fs = require('fs')

class I18nParser {
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

  static getTransList(fileName: string): { path: string; name: string }[] {
    const transPath = I18nParser.getTransPathByFilePath(fileName)
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

    return transList
  }

  static getTransByKey(
    key: string,
    fileName: string
  ): { lng: string; str: string }[] {
    const transList = I18nParser.getTransList(fileName)
    const [lngFileName, ...lngKey] = key.split('.')

    return transList.map(listItem => {
      const lngFilePath = require.resolve(`${listItem.path}/${lngFileName}`)
      delete require.cache[lngFilePath] // 清除之前的缓存
      const lngFile = fs.existsSync(lngFilePath) ? require(lngFilePath) : {}

      return {
        lng: listItem.name,
        str: lodash.get(lngFile, lngKey),
      }
    })
  }
}

export default I18nParser
