import * as vscode from 'vscode'
import * as fs from 'fs'
import { uniq } from 'lodash'

// for visualize the regex, you can use https://regexper.com/
export const KEY_REG = /(?:i18n[ (]path=|v-t=['"]|(?:this\.|\$|i18n\.)(?:(?:d|n)\(.*?, ?|(?:t|tc|te)\())['"]([^]+?)['"]/g

export class KeyDetector {
  static getKeyByContent (text: string) {
    const keys = (text.match(KEY_REG) || [])
      .map(key => key.replace(KEY_REG, '$1'))

    return uniq(keys)
  }

  static getKeyByFile (filePath: string) {
    const file: string = fs.readFileSync(filePath, 'utf-8')
    return KeyDetector.getKeyByContent(file)
  }

  static getKeyRange (document: vscode.TextDocument, position: vscode.Position) {
    return document.getWordRangeAtPosition(position, KEY_REG)
  }

  static getKey (document: vscode.TextDocument, position: vscode.Position) {
    const keyRange = KeyDetector.getKeyRange(document, position)
    return keyRange
      ? document.getText(keyRange).replace(KEY_REG, '$1')
      : undefined
  }

  static getKeys (text: vscode.TextDocument | string) {
    const keys = []
    if (typeof text !== 'string')
      text = text.getText()
    let match = null
    while (match = KEY_REG.exec(text)) {
      const index = match.index
      const matchKey = match[0]
      const key = matchKey.replace(new RegExp(KEY_REG), '$1')
      const end = index + match[0].length - 1
      const start = end - match[1].length
      keys.push({
        key,
        start,
        end,
      })
    }
    return keys
  }
}
