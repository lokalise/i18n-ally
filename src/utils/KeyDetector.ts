import * as vscode from 'vscode'
import * as fs from 'fs'

const keyReg = /(?:\$t|this\.t|i18n\.t)\(['"]([^]+?)['"]/g

export default class {
  static getKeyByFile(filePath: string) {
    const file: string = fs.readFileSync(filePath, 'utf-8')
    const keys = (file.match(keyReg) || []).map(key =>
      key.replace(keyReg, '$1')
    )

    return [...new Set(keys)]
  }

  static getKey(document: vscode.TextDocument, position: vscode.Position) {
    const keyRange = document.getWordRangeAtPosition(position, keyReg)
    return keyRange
      ? document.getText(keyRange).replace(keyReg, '$1')
      : undefined
  }
}
