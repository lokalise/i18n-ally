import { ExtensionContext, window } from 'vscode'
import { LocalesTreeProvider } from './LocalesTreeView'
import { KeyDetector, LocaleNode } from '../core'
import { ExtensionModule } from '../modules'

export class FileLocalesTreeProvider extends LocalesTreeProvider {
  constructor (
    ctx: ExtensionContext,
  ) {
    super(ctx, [], true)
    this.loadCurrentDocument()
    window.onDidChangeActiveTextEditor(() => this.loadCurrentDocument())
  }

  loadCurrentDocument () {
    this.includePaths = KeyDetector.getKeyByContent(window.activeTextEditor.document.getText())
    this.refresh()
  }

  getRoots () {
    const roots = super.getRoots()
    const realPaths = roots.map(i => i.node.keypath)
    const shadowPaths = this.includePaths.filter(path => !realPaths.includes(path))
    for (const keypath of shadowPaths) {
      const node = new LocaleNode(keypath, {})
      roots.push(this.newItem(node))
    }
    return roots
  }
}

const m: ExtensionModule = (ctx) => {
  const provider = new FileLocalesTreeProvider(ctx)

  return window.registerTreeDataProvider('locales-tree-file', provider)
}

export default m
