import { TextDocument, Position, Range } from 'vscode'
import { KeyInDocument } from '../core'
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

  static getKeys (document: TextDocument | string): KeyInDocument[] {
    let regs = []
    let text = ''

    let namespaces: string[] = []

    if (typeof document !== 'string') {
      regs = Global.getKeyMatchReg(document.languageId, document.uri.fsPath)
      text = document.getText()

      if (Global.hasFeatureEnabled('namespace'))
        namespaces = Global.getDefaultNamespaces(document)
    }
    else {
      regs = Global.getKeyMatchReg()
      text = document
    }

    const namespace = namespaces[0] // TODO: enumerate multiple namespaces

    const keys = []
    for (const reg of regs) {
      let match = null
      // eslint-disable-next-line no-cond-assign
      while (match = reg.exec(text)) {
        const matchString = match[0]
        const key = match[1]
        const start = match.index + matchString.indexOf(key)
        const end = start + key.length
        const keypath = namespace && !key.includes(':')
          ? `${namespace}.${key}`
          : key

        keys.push({
          key: keypath,
          start,
          end,
        })
      }
    }
    return keys
  }
}
