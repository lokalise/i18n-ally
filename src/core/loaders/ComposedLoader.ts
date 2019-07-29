import _ from 'lodash'
import { Disposable } from 'vscode'
import { LocaleNode, LocaleTree, FlattenLocaleTree } from '../types'
import { Translator } from '../Translator'
import { Loader } from './Loader'

export class ComposedLoader extends Loader {
  constructor () {
    super('[Composed]')
    this._disposables.push(
      Translator.onDidChange(() => this._onDidChange.fire())
    )
  }

  _loaders: Loader[] = []
  _watchers: Disposable[] = []

  get loaders () {
    return this._loaders
  }

  set loaders (value: Loader[]) {
    this._watchers.forEach(d => d.dispose())
    this._loaders = value
    this._watchers = this.loaders.map(loader =>
      loader.onDidChange(e => this._onDidChange.fire(`${e}+${this.name}`))
    )
    // this._onDidChange.fire(this.name)
  }

  get root (): LocaleTree {
    const children: Record<string | number, LocaleTree | LocaleNode> = {}
    for (const loader of this._loaders) {
      const loaderChildren = loader.root.children
      for (const key of Object.keys(loaderChildren))
        children[key] = loaderChildren[key]
    }
    return new LocaleTree({ keypath: '', children })
  }

  get flattenLocaleTree (): FlattenLocaleTree {
    const children: Record<string | number, LocaleNode> = {}
    for (const loader of this._loaders) {
      const loaderChildren = loader.flattenLocaleTree
      for (const key of Object.keys(loaderChildren))
        children[key] = loaderChildren[key]
    }
    return children
  }

  get locales (): string[] {
    return _(this._loaders)
      .flatMap(l => l.locales)
      .uniq()
      .value()
  }

  getShadowFilePath (keypath: string, locale: string) {
    for (const loader of this._loaders.reverse()) {
      const value = loader.getShadowFilePath(keypath, locale)
      if (value)
        return value
    }
  }

  getTreeNodeByKey (keypath: string, tree?: LocaleTree) {
    for (const loader of this._loaders.reverse()) {
      const value = loader.getTreeNodeByKey(keypath, tree)
      if (value)
        return value
    }
  }

  getFilepathByKey (keypath: string, locale?: string) {
    for (const loader of this._loaders.reverse()) {
      const value = loader.getFilepathByKey(keypath, locale)
      if (value)
        return value
    }
  }

  getValueByKey (keypath: string, locale?: string, clamp: boolean = true, stringifySpace?: number) {
    for (const loader of this._loaders.reverse()) {
      const value = loader.getValueByKey(keypath, locale, clamp, stringifySpace)
      if (value)
        return value
    }
  }

  fire (src?: string) {
    this._onDidChange.fire(src || this.name)
  }

  // TODO:sfc merge tree nodes
}
