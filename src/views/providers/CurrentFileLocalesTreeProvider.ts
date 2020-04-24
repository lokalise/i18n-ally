import { ExtensionContext, window } from 'vscode'
import { uniq } from 'lodash'
import { resolveFlattenRootKeypath } from '../../utils'
import { KeyDetector, LocaleNode, Global } from '../../core'
import { LocaleTreeItem } from '../items/LocaleTreeItem'
import { LocalesTreeProvider } from './LocalesTreeProvider'

export class CurrentFileLocalesTreeProvider extends LocalesTreeProvider {
  protected name = 'CurrentFileLocalesTreeProvider'

  constructor(
    ctx: ExtensionContext,
  ) {
    super(ctx, [], true)
    this.loadCurrentDocument()
    window.onDidChangeActiveTextEditor(() => this.loadCurrentDocument())
    window.onDidChangeTextEditorSelection(() => this.loadCurrentDocument())
  }

  loadCurrentDocument() {
    const editor = window.activeTextEditor

    if (!editor)
      return

    if (!Global.isLanguageIdSupported(editor.document.languageId))
      this.includePaths = []
    else
      this.includePaths = uniq(KeyDetector.getKeys(editor.document).map(i => i.key))

    this.refresh()
  }

  getRoots() {
    const roots = super.getRoots()
    const realPaths = roots.map(i => resolveFlattenRootKeypath(i.node.keypath))
    if (!this.includePaths)
      return roots

    // create shadow nodes
    const shadowPaths = this.includePaths
      .filter(path => !realPaths.includes(path))

    for (const keypath of shadowPaths) {
      let node = this.loader.getTreeNodeByKey(keypath)
      if (node && node.type === 'tree') {
        roots.push(new LocaleTreeItem(this.ctx, node, this.flatten))
      }
      else {
        node = new LocaleNode({ keypath, shadow: true })
        roots.push(new LocaleTreeItem(this.ctx, node, this.flatten))
      }
    }

    return this.sort(roots)
  }
}
