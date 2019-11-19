import { Disposable, EventEmitter } from 'vscode'
import _ from 'lodash'
import { Log } from '../../utils'
import { LocaleTree, LocaleNode, LocaleRecord, FlattenLocaleTree, Coverage, FileInfo, PendingWrite, NodeOptions } from '../types'
import { Config, Global } from '..'

export abstract class Loader extends Disposable {
  protected _disposables: Disposable[] = []
  protected _onDidChange = new EventEmitter<string>()
  readonly onDidChange = this._onDidChange.event

  protected _flattenLocaleTree: FlattenLocaleTree = {}
  protected _localeTree: LocaleTree = new LocaleTree({ keypath: '' })

  constructor (
    public readonly name: string,
  ) {
    super(() => this.onDispose())
  }

  abstract get locales(): string[]

  abstract getShadowFilePath(keypath: string, locale: string): string | undefined

  get root () {
    return this._localeTree
  }

  get flattenLocaleTree () {
    return this._flattenLocaleTree
  }

  get files (): FileInfo[] {
    return []
  }

  splitKeypath (keypath: string): string[] {
    return keypath.replace(/\[(.*?)\]/g, '.$1').split('.')
  }

  getCoverage (locale: string, keys?: string[]): Coverage | undefined {
    const totalKeys = keys || Object.keys(this.flattenLocaleTree)
    totalKeys.sort()
    const translatedKeys = totalKeys.filter(key => this.flattenLocaleTree[key] && this.flattenLocaleTree[key].getValue(locale))
    const missingKeys = totalKeys.filter(key => (!this.flattenLocaleTree[key]) || this.flattenLocaleTree[key].getValue(locale) == null)
    const emptyKeys = totalKeys.filter(key => !translatedKeys.includes(key) && !missingKeys.includes(key))
    const total = totalKeys.length
    const translated = translatedKeys.length
    const missing = missingKeys.length
    return {
      locale,
      total,
      missing,
      translated,
      missingKeys,
      totalKeys,
      translatedKeys,
      emptyKeys,
    }
  }

  protected updateTree (tree: LocaleTree | undefined, data: any, keypath: string, keyname: string, options: NodeOptions, isCollection = false) {
    tree = tree || new LocaleTree({
      keypath,
      keyname,
      isCollection,
      sfc: options.sfc,
      meta: options.meta,
    })
    tree.values[options.locale] = data
    for (const [key, value] of Object.entries(data)) {
      const newKeyPath = keypath
        ? (isCollection
          ? `${keypath}[${key}]`
          : `${keypath}.${key}`)
        : (isCollection
          ? `[${key}]`
          : key)

      let node = tree.getChild(key)

      // should go nested
      if (_.isArray(value)) {
        let subtree: LocaleTree|undefined
        if (node && node.type === 'tree')
          subtree = node as LocaleTree

        tree.setChild(key, this.updateTree(subtree, value, newKeyPath, key, options, true))
        continue
      }

      if (_.isObject(value)) {
        let subtree: LocaleTree|undefined
        if (node && node.type === 'tree')
          subtree = node as LocaleTree

        tree.setChild(key, this.updateTree(subtree, value, newKeyPath, key, options))
        continue
      }

      // init node
      if (!node) {
        node = new LocaleNode({
          keypath: newKeyPath,
          keyname: key,
          readonly: options.readonly,
          sfc: options.sfc,
          meta: options.meta,
        })
        tree.setChild(key, node)
        this._flattenLocaleTree[node.keypath] = node
      }

      // add locales to exitsing node
      if (node && node.type === 'node') {
        node.locales[options.locale] = new LocaleRecord({
          keypath: newKeyPath,
          keyname: key,
          value: `${value}`,
          locale: options.locale,
          filepath: options.filepath,
          sfc: options.sfc,
          meta: options.meta,
          readonly: options.readonly,
        })
      }
    }
    return tree
  }

  getTreeNodeByKey (keypath: string, tree?: LocaleTree): LocaleNode | LocaleTree | undefined {
    const root = !tree
    tree = tree || this.root

    // flatten style
    if (root) {
      const node = tree.getChild(keypath)
      if (node)
        return node
    }

    // tree style
    const keys = this.splitKeypath(keypath)
    const head = keys[0]
    const remaining = keys.slice(1).join('.')
    const node = tree.getChild(head)
    if (remaining === '')
      return node
    if (node && node.type === 'tree')
      return this.getTreeNodeByKey(remaining, node)
    return undefined
  }

  getFilepathByKey (key: string, locale?: string) {
    locale = locale || Config.displayLanguage
    const record = this.getRecordByKey(key, locale)
    if (record && record.filepath)
      return record.filepath
    return undefined
  }

  getValueByKey (keypath: string, locale?: string, maxlength = 0, stringifySpace?: number) {
    locale = locale || Config.displayLanguage

    const node = this.getTreeNodeByKey(keypath)

    if (!node)
      return undefined

    if (node.type === 'tree') {
      const value = node.values[locale]
      if (!value)
        return undefined
      let text = JSON
        .stringify(value, null, stringifySpace)
        .replace(/"(\w+?)":/g, ' $1:')
        .replace(/}/, ' }')

      if (maxlength && text.length > maxlength) {
        if (node.isCollection)
          text = '[…]'
        else
          text = '{…}'
      }
      return text
    }
    else {
      let value = node.getValue(locale)
      if (!value)
        return
      if (maxlength && value.length > maxlength)
        value = `${value.substring(0, maxlength)}…`
      return value
    }
  }

  getShadowNodeByKey (keypath: string) {
    return new LocaleNode({ keypath, shadow: true })
  }

  getNodeByKey (keypath: string, shadow = false): LocaleNode | undefined {
    const node = this.getTreeNodeByKey(keypath)
    if (!node && shadow)
      return this.getShadowNodeByKey(keypath)
    if (node && node.type !== 'tree')
      return node
  }

  getTranslationsByKey (keypath: string, shadow = true) {
    const node = this.getNodeByKey(keypath, shadow)
    if (!node)
      return {}
    if (shadow)
      return this.getShadowLocales(node)
    else
      return node.locales
  }

  getRecordByKey (keypath: string, locale: string, shadow = false): LocaleRecord | undefined {
    const trans = this.getTranslationsByKey(keypath, shadow)
    return trans[locale]
  }

  getShadowLocales (node: LocaleNode, listedLocales?: string[]) {
    const locales: Record<string, LocaleRecord> = {}

    listedLocales = listedLocales || Global.getVisibleLocales(this.locales)

    listedLocales.forEach((locale) => {
      if (node.locales[locale]) {
        // locales already exists
        locales[locale] = node.locales[locale]
      }
      else {
        // create shadow locale
        locales[locale] = new LocaleRecord({
          locale,
          value: '',
          shadow: true,
          keyname: node.keyname,
          keypath: node.keypath,
          meta: node.meta,
          filepath: this.getShadowFilePath(node.keypath, locale),
          readonly: node.readonly,
        })
      }
    })

    return locales
  }

  abstract async write (pendings: PendingWrite | PendingWrite[]): Promise<void>

  canHandleWrites (pending: PendingWrite) {
    return false
  }

  protected onDispose () {
    Log.info(`🗑 Disposing loader "${this.name}"`)
    this._disposables.forEach(d => d.dispose())
    this._disposables = []
  }
}
