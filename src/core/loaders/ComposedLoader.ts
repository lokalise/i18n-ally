import _ from 'lodash'
import { LocaleNode, LocaleTree } from '../types'
import { Loader } from './Loader'

export class ComposedLoader extends Loader {
  constructor (
    public loaders: Loader[] = []
  ) {
    super('[Composed]')
  }

  get root (): LocaleTree {
    const children: Record<string | number, LocaleTree | LocaleNode> = {}
    for (const loader of this.loaders) {
      const loaderChildren = loader.root.children
      for (const key of Object.keys(loaderChildren))
        children[key] = loaderChildren[key]
    }
    return new LocaleTree({ keypath: '', children })
  }

  get locales (): string[] {
    return _(this.loaders)
      .flatMap(l => l.locales)
      .uniq()
      .value()
  }

  getShadowFilePath (keypath: string, locale: string) {
    for (const loader of this.loaders.reverse()) {
      const value = loader.getShadowFilePath(keypath, locale)
      if (value)
        return value
    }
  }

  getTreeNodeByKey (keypath: string, tree?: LocaleTree) {
    for (const loader of this.loaders.reverse()) {
      const value = loader.getTreeNodeByKey(keypath, tree)
      if (value)
        return value
    }
  }
}
