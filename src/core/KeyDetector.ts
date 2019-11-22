import { TextDocument, Position, Range } from 'vscode'
import { Global } from './Global'

export class KeyDetector {
  static getKeyByContent (text: string) {
    const keys = new Set<string>()
    const regs = Global.getKeyMatchReg()

    for (const reg of regs) {
      (text.match(reg) || [])
        .forEach(key =>
          keys.add(key.replace(reg, '$1')),
        )
    }

    return Array.from(keys)
  }

  static getKeyRange (document: TextDocument, position: Position) {
    const regs = Global.getKeyMatchReg(document.languageId, document.uri.fsPath)
    for (const regex of regs) {
      const range = document.getWordRangeAtPosition(position, regex)
      if (range) {
        const key = document.getText(range).replace(regex, '$1')
        return { range, key }
      }
    }
  }

  static getKey (document: TextDocument, position: Position) {
    const keyRange = KeyDetector.getKeyRange(document, position)
    if (!keyRange)
      return
    return keyRange.key
  }

  static getKeyAndRange (document: TextDocument, position: Position) {
    const { range, key } = KeyDetector.getKeyRange(document, position) || {}
    if (!range || !key)
      return
    const end = range.end.character - 1
    const start = end - key.length
    const keyRange = new Range(
      new Position(range.end.line, start),
      new Position(range.end.line, end),
    )
    return {
      range: keyRange,
      key,
    }
  }

  static getKeys (document: TextDocument | string) {
    let regs = []
    let text = ''
    if (typeof document !== 'string') {
      regs = Global.getKeyMatchReg(document.languageId, document.uri.fsPath)
      text = document.getText()
    }
    else {
      regs = Global.getKeyMatchReg()
      text = document
    }

    const keys = []
    for (const reg of regs) {
      let match = null
      // eslint-disable-next-line no-cond-assign
      while (match = reg.exec(text)) {
        const matchString = match[0]
        const key = match[1]
        const start = match.index + matchString.indexOf(key)
        const end = start + key.length
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
