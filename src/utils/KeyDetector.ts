import * as vscode from 'vscode'

const keyReg = /(?:\$t|this\.t|i18n\.t)\(['"]([^]+?)['"][^]*?\)/g

export default class {
  static getKey(document: vscode.TextDocument, position: vscode.Position) {
    const keyRange = document.getWordRangeAtPosition(position, keyReg)
    return keyRange
      ? document.getText(keyRange).replace(keyReg, '$1')
      : undefined
  }
}
