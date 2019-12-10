import { TextDocument, Position, Range } from 'vscode'
import { KeyInDocument } from '../core'
import { regexFindKeys } from '../utils'
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

  static getKeys (document: TextDocument | string, regs?: RegExp[]): KeyInDocument[] {
    let text = ''

    let namespaces: string[] = []

    if (typeof document !== 'string') {
      regs = regs ?? Global.getKeyMatchReg(document.languageId, document.uri.fsPath)
      text = document.getText()

      if (Global.usingNamespace)
        namespaces = Global.getDefaultNamespaces(document)
    }
    else {
      regs = Global.getKeyMatchReg()
      text = document
    }

    return regexFindKeys(text, regs, namespaces)
  }
}
