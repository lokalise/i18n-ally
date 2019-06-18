import { Range } from 'vscode'
import { getKeyname } from './utils'
import { Global } from '.'

export interface ParsedFile {
  filepath: string
  locale: string
  value: object
  nested: boolean
}

export interface LocaleRecord {
  keypath: string
  keyname: string
  value: string
  locale: string
  filepath?: string
  shadow?: boolean
  type: 'record'
}

export class LocaleNode {
  type: 'node' = 'node'

  constructor (
    public readonly keypath: string,
    public readonly keyname: string = '',
    public readonly locales: Record<string, LocaleRecord> = {},
    public readonly shadow = false
  ) {
    this.keyname = keyname || getKeyname(keypath)
  }

  getValue (locale: string, fallback = '') {
    return (this.locales[locale] && this.locales[locale].value) || fallback
  }

  get value () {
    return this.getValue(Global.displayLanguage)
  }
}

export interface FlattenLocaleTree extends Record<string, LocaleNode> {}

export interface LocaleTree {
  keypath: string
  keyname: string
  children: Record<string, LocaleTree|LocaleNode>
  shadow?: boolean
  values: Record<string, object>
  type: 'tree'
}

export interface Coverage {
  locale: string
  keys: string[]
  translated: number
  total: number
}

export interface PendingWrite {
  locale: string
  keypath: string
  filepath?: string
  value?: string
}

export interface ExtractTextOptions {
  filepath: string
  text: string
  range: Range
}
