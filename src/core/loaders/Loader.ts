import { Disposable } from 'vscode'
import { Log } from '../../utils'
import { LocaleTree, LocaleNode, LocaleRecord } from '../types'
import { Config, Global } from '..'

export abstract class Loader extends Disposable {
  protected _disposables: Disposable[] = []

  constructor (
    public readonly name: string
  ) {
    super(() => this.onDispose())
  }

  protected onDispose () {
    Log.info(`🗑 Disposing loader "${this.name}"`)
    this._disposables.forEach(d => d.dispose())
    this._disposables = []
  }

  abstract get root(): LocaleTree
  abstract get locales(): string[]

  abstract getShadowFilePath(keypath: string, locale: string): string | undefined

  splitKeypath (keypath: string): string[] {
    return keypath.replace(/\[(.*?)\]/g, '.$1').split('.')
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

  getValueByKey (keypath: string, locale?: string, clamp: boolean = true, stringifySpace?: number) {
    locale = locale || Config.displayLanguage

    const maxlength = Config.annotationMaxLength
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

      if (clamp && maxlength && text.length > maxlength) {
        if (node.isCollection)
          text = '[…]'
        else
          text = '{…}'
      }
      return text
    }
    else {
      let value = node.getValue(locale)
      if (clamp && maxlength && value.length > maxlength)
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

  getShadowLocales (node: LocaleNode) {
    const locales: Record<string, LocaleRecord> = {}

    Global.getVisibleLocales(this.locales)
      .forEach((locale) => {
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
            filepath: this.getShadowFilePath(node.keypath, locale),
            readonly: node.readonly,
          })
        }
      })
    return locales
  }
}
