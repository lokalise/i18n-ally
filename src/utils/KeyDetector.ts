import * as vscode from 'vscode'
import * as fs from 'fs'

export const KEY_REG = /(?:i18n[ (]path=|(?:\$t|\$tc|\$d|\$n|\$te|this\.t|i18n\.t|[^\w]t)\()['"]([^]+?)['"]/g

export default class KeyDetector {
  static getKeyByContent (text: string) {
    const keys = (text.match(KEY_REG) || []).map(key =>
      key.replace(KEY_REG, '$1')
    )

    return [...new Set(keys)]
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
}
