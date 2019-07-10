import { Range } from 'vscode'
import { getKeyname } from '../utils/utils'
import { Global } from '.'

export interface ParsedFile {
  filepath: string
  locale: string
  value: object
  nested: boolean
  readonly?: boolean
}

export interface INode {
  keypath: string
  keyname?: string
  filepath?: string
  shadow?: boolean
  readonly?: boolean
}

export interface ILocaleRecord extends INode {
  value: string
  locale: string
}

export interface ILocaleNode extends INode {
  locales?: Record<string, LocaleRecord>
}

export interface ILocaleTree extends INode {
  children?: Record<string, LocaleTree | LocaleNode>
  values?: Record<string, object>
}

abstract class BaseNode implements INode {
  readonly keypath: string
  readonly keyname: string
  readonly filepath?: string
  readonly shadow?: boolean
  readonly readonly?: boolean

  constructor (data: INode) {
    this.keypath = data.keypath
    this.keyname = data.keyname || getKeyname(data.keypath)
    this.filepath = data.filepath
    this.shadow = data.shadow
    this.readonly = data.readonly
  }
}

export class LocaleRecord extends BaseNode implements ILocaleRecord {
  readonly type: 'record' = 'record'

  readonly locale: string
  readonly value: string

  constructor (data: ILocaleRecord) {
    super(data)
    this.value = data.value
    this.locale = data.locale
  }
}

export class LocaleNode extends BaseNode implements ILocaleNode {
  readonly type: 'node' = 'node'
  readonly locales: Record<string, LocaleRecord>

  constructor (data: ILocaleNode) {
    super(data)
    this.locales = data.locales || {}
  }

  getValue (locale: string, fallback = '') {
    return (this.locales[locale] && this.locales[locale].value) || fallback
  }

  get value () {
    return this.getValue(Global.displayLanguage)
  }
}

export class LocaleTree extends BaseNode implements ILocaleTree {
  readonly type: 'tree' = 'tree'

  readonly children: Record<string, LocaleTree|LocaleNode>
  readonly values: Record<string, object>

  constructor (data: ILocaleTree) {
    super(data)
    this.children = data.children || {}
    this.values = data.values || {}
  }
}

export interface FlattenLocaleTree extends Record<string, LocaleNode> {}

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

export type Node = LocaleNode | LocaleRecord | LocaleTree
