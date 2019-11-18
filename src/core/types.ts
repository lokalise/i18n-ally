/* eslint-disable no-dupe-class-members */
/* eslint-disable @typescript-eslint/interface-name-prefix */
import { Range } from 'vscode'
import { getKeyname } from '../utils/utils'
import { Config } from './Config'

export interface FileInfo {
  filepath: string
  locale: string
  nested: boolean
  readonly?: boolean
}

export interface ParsedFile extends FileInfo {
  value: object
}

export interface NodeOptions{
  locale: string
  readonly?: boolean
  filepath: string
  sfc?: boolean
  meta?: NodeMeta
}

export interface NodeMeta {
  sfcSectionIndex?: number
}

export interface INode {
  keypath: string
  keyname?: string
  filepath?: string
  shadow?: boolean
  readonly?: boolean
  sfc?: boolean
  meta?: NodeMeta
}

export interface ILocaleRecord extends INode {
  value: string
  locale: string
}

export interface ILocaleNode extends INode {
  locales?: Record<string, LocaleRecord>
}

export interface ILocaleTree extends INode {
  children?: Record<string | number, LocaleTree | LocaleNode>
  values?: Record<string, object>
  isCollection?: boolean
}

abstract class BaseNode implements INode {
  readonly keypath: string
  readonly keyname: string
  readonly filepath?: string
  readonly shadow?: boolean
  readonly readonly?: boolean
  readonly sfc?: boolean
  readonly meta?: NodeMeta

  constructor (data: INode) {
    this.keypath = data.keypath
    this.keyname = data.keyname || getKeyname(data.keypath)
    this.filepath = data.filepath
    this.shadow = data.shadow
    this.readonly = data.readonly
    this.sfc = data.sfc
    this.meta = data.meta
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

  public getValue (locale?: string) {
    locale = locale || Config.displayLanguage
    return (this.locales[locale] && this.locales[locale].value)
  }

  get value () {
    return this.getValue() || ''
  }
}

export class LocaleTree extends BaseNode implements ILocaleTree {
  readonly type: 'tree' = 'tree'

  readonly children: Record<string | number, LocaleTree|LocaleNode>
  readonly values: Record<string, object>
  readonly isCollection: boolean

  constructor (data: ILocaleTree) {
    super(data)
    this.children = data.children || {}
    this.values = data.values || {}
    this.isCollection = data.isCollection || false
  }

  getChild (key: string) {
    let child = this.children[key]
    if (this.isCollection && !child) {
      const index = parseInt(key)
      if (!isNaN(index))
        child = this.children[index]
    }
    return child
  }

  setChild (key: string, value: LocaleTree | LocaleNode) {
    const index = parseInt(key)
    if (this.isCollection && !isNaN(index))
      this.children[index] = value
    else
      this.children[key] = value
  }
}

export interface FlattenLocaleTree extends Record<string, LocaleNode> {}

export interface Coverage {
  locale: string
  translated: number
  total: number
  missing: number
  totalKeys: string[]
  translatedKeys: string[]
  missingKeys: string[]
  emptyKeys: string[]
}

export interface PendingWrite {
  locale: string
  keypath: string
  filepath?: string
  value?: string
  sfc?: boolean
}

export interface ExtractTextOptions {
  filepath: string
  text: string
  range: Range
  languageId?: string
}

export type Node = LocaleNode | LocaleRecord | LocaleTree
