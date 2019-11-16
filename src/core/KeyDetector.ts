import * as vscode from 'vscode'
import { File } from '../utils/File'
import { Global } from './Global'

export class KeyDetector {
  static get KeyMatchReg () {
    return Global.getKeyMatchReg()
  }

  static getKeyByContent (text: string) {
    const keys = new Set<string>()

    for (const reg of this.KeyMatchReg) {
      (text.match(reg) || [])
        .forEach(key =>
          keys.add(key.replace(reg, '$1')),
        )
    }

    return Array.from(keys)
  }

  static getKeyByFile (filePath: string) {
    const file: string = File.readSync(filePath)
    return KeyDetector.getKeyByContent(file)
  }

  static getKeyRange (document: vscode.TextDocument, position: vscode.Position) {
    for (const regex of this.KeyMatchReg) {
      const range = document.getWordRangeAtPosition(position, regex)
      if (range) {
        const key = document.getText(range).replace(regex, '$1')
        return { range, key }
      }
    }
  }

  static getKey (document: vscode.TextDocument, position: vscode.Position) {
    const keyRange = KeyDetector.getKeyRange(document, position)
    if (!keyRange)
      return
    return keyRange.key
  }

  static getKeyAndRange (document: vscode.TextDocument, position: vscode.Position) {
    const { range, key } = KeyDetector.getKeyRange(document, position) || {}
    if (!range || !key)
      return
    const end = range.end.character - 1
    const start = end - key.length
    const keyRange = new vscode.Range(
      new vscode.Position(range.end.line, start),
      new vscode.Position(range.end.line, end),
    )
    return {
      range: keyRange,
      key,
    }
  }

  static getKeys (text: vscode.TextDocument | string) {
    const keys = []
    if (typeof text !== 'string')
      text = text.getText()
    for (const reg of this.KeyMatchReg) {
      let match = null
      // eslint-disable-next-line no-cond-assign
      while (match = reg.exec(text)) {
        const index = match.index
        const matchKey = match[0]
        const key = matchKey.replace(new RegExp(reg), '$1')
        const end = index + match[0].length - 1
        const start = end - match[1].length
        keys.push({
          key,
          start,
          end,
        })
      }
    }
    return keys
  }
}
