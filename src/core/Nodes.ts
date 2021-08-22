/* eslint-disable no-use-before-define */
import { linkKeyMatcher, linkKeyPrefixMatcher, linkedKeyModifiers } from '../meta'
import { Global } from './Global'
import { Config } from './Config'
import { CurrentFile } from './CurrentFile'
import { OptionalFeatures, NodeMeta } from './types'
import { getKeyname, Log } from '~/utils'

export interface INode {
  keypath: string
  keyname?: string
  filepath?: string
  shadow?: boolean
  readonly?: boolean
  features?: OptionalFeatures
  meta?: NodeMeta
}

abstract class BaseNode implements INode {
  readonly keypath: string
  readonly keyname: string
  readonly filepath?: string
  readonly shadow?: boolean
  readonly readonly?: boolean
  readonly features?: OptionalFeatures
  readonly meta?: NodeMeta

  constructor(data: INode) {
    this.keypath = data.keypath
    this.keyname = data.keyname || getKeyname(data.keypath)
    this.filepath = data.filepath
    this.shadow = data.shadow
    this.readonly = data.readonly
    this.features = data.features
    this.meta = data.meta
  }
}

export class LocaleRecord extends BaseNode implements ILocaleRecord {
  readonly type: 'record' = 'record'

  readonly locale: string
  readonly value: string

  constructor(data: ILocaleRecord) {
    super(data)
    this.value = data.value
    this.locale = data.locale
  }
}

export class LocaleNode extends BaseNode implements ILocaleNode {
  readonly type: 'node' = 'node'
  readonly locales: Record<string, LocaleRecord>

  constructor(data: ILocaleNode) {
    super(data)
    this.locales = data.locales || {}
  }

  public getValue(locale?: string, interpolate = false, visitedStack: string[] = []) {
    locale = locale || Config.displayLanguage
    let value = (this.locales[locale] && this.locales[locale].value)

    // This is for interplate linked messages
    // Refer to: https://kazupon.github.io/vue-i18n/guide/messages.html#linked-locale-messages
    if (value && interpolate && Global.hasFeatureEnabled('LinkedMessages')) {
      const matches = value.match(linkKeyMatcher)
      if (matches) {
        for (const link of matches) {
          const linkKeyPrefixMatches: any = link.match(linkKeyPrefixMatcher)
          const [linkPrefix, formatterName] = linkKeyPrefixMatches as (string|undefined)[]
          const keypath = link.replace(linkPrefix || '', '')

          if (visitedStack.includes(keypath)) {
            Log.warn(`Circular reference found. "${link}" is already visited in the chain of ${visitedStack.reverse().join(' <- ')}`)
            return value
          }
          visitedStack.push(keypath)

          let translated = CurrentFile.loader.getNodeByKey(keypath)?.getValue(locale, interpolate, visitedStack) || ''

          if (formatterName && linkedKeyModifiers[formatterName])
            translated = linkedKeyModifiers[formatterName](translated)

          if (translated)
            value = value.replace(link, translated)
        }
      }
    }

    return value
  }

  get value() {
    return this.getValue(undefined, true) || ''
  }
}

export class LocaleTree extends BaseNode implements ILocaleTree {
  readonly type: 'tree' = 'tree'

  readonly children: Record<string | number, LocaleTree|LocaleNode>
  readonly values: Record<string, object>
  readonly isCollection: boolean

  constructor(data: ILocaleTree) {
    super(data)
    this.children = data.children || {}
    this.values = data.values || {}
    this.isCollection = data.isCollection || false
  }

  getChild(key: string) {
    let child = this.children[key]
    if (this.isCollection && !child) {
      const index = parseInt(key)
      if (!isNaN(index))
        child = this.children[index]
    }
    return child
  }

  setChild(key: string, value: LocaleTree | LocaleNode) {
    const index = parseInt(key)
    if (this.isCollection && !isNaN(index))
      this.children[index] = value
    else
      this.children[key] = value
  }
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

export interface FlattenLocaleTree extends Record<string, LocaleNode> {}

export type Node = LocaleNode | LocaleRecord | LocaleTree
