import { Disposable, EventEmitter } from 'vscode'
import _, { uniq } from 'lodash'
import { LocaleTree, LocaleNode, LocaleRecord, FlattenLocaleTree } from '../Nodes'
import { Coverage, FileInfo, PendingWrite, NodeOptions, RewriteKeySource, RewriteKeyContext, DataProcessContext } from '../types'
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

  get keys (): string[] {
    return uniq(Object.keys(this.flattenLocaleTree))
  }

  splitKeypath (keypath: string): string[] {
    return keypath.replace(/\[(.*?)\]/g, '.$1').split('.')
  }

  getCoverage (locale: string, keys?: string[]): Coverage | undefined {
    const totalKeys = keys || this.keys
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
      features: options.features,
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
          features: options.features,
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
          features: options.features,
          meta: options.meta,
          readonly: options.readonly,
        })
      }
    }
    return tree
  }

  rewriteKeys (key: string, source: RewriteKeySource, context: RewriteKeyContext = {}) {
    for (const framework of Global.enabledFrameworks)
      key = framework.rewriteKeys(key, source, context)
    return key
  }

  preprocessData (data: object, context: DataProcessContext = {}) {
    for (const framework of Global.enabledFrameworks)
      data = framework.preprocessData(data, context)
    return data
  }

  deprocessData (data: object, context: DataProcessContext = {}) {
    for (const framework of Global.enabledFrameworks)
      data = framework.deprocessData(data, context)
    return data
  }

  getTreeNodeByKey (key: string, tree?: LocaleTree): LocaleNode | LocaleTree | undefined {
    const root = !tree
    tree = tree || this.root

    // flatten style
    if (root) {
      const node = tree.getChild(key)
      if (node)
        return node
    }

    // tree style
    const keys = this.splitKeypath(key)
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

  getValueByKey (key: string, locale?: string, maxlength = 0, stringifySpace?: number, context: RewriteKeyContext = {}) {
    locale = locale || Config.displayLanguage

    const node = this.getTreeNodeByKey(key)

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
      let value = node.getValue(locale, true)
      if (!value)
        return
      if (maxlength && value.length > maxlength)
        value = `${value.substring(0, maxlength)}…`
      return value
    }
  }

  getShadowNodeByKey (key: string) {
    return new LocaleNode({ keypath: key, shadow: true })
  }

  getNodeByKey (key: string, shadow = false): LocaleNode | undefined {
    const node = this.getTreeNodeByKey(key)
    if (!node && shadow)
      return this.getShadowNodeByKey(key)
    if (node && node.type !== 'tree')
      return node
  }

  getTranslationsByKey (key: string, shadow = true) {
    const node = this.getNodeByKey(key, shadow)
    if (!node)
      return {}
    if (shadow)
      return this.getShadowLocales(node)
    else
      return node.locales
  }

  getRecordByKey (key: string, locale: string, shadow = false): LocaleRecord | undefined {
    const trans = this.getTranslationsByKey(key, shadow)
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
    // Log.info(`🗑 Disposing loader "${this.name}"`)
    this._disposables.forEach(d => d.dispose())
    this._disposables = []
  }
}
