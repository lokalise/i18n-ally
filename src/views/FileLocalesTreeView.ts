import { ExtensionContext, window, commands } from 'vscode'
import { KeyDetector, LocaleNode, Global } from '../core'
import { ExtensionModule } from '../modules'
import { LocalesTreeProvider, LocaleTreeView } from './LocalesTreeView'

export class FileLocalesTreeProvider extends LocalesTreeProvider {
  protected name = 'FileLocalesTreeProvider'

  constructor (
    ctx: ExtensionContext,
  ) {
    super(ctx, [], true)
    this.loadCurrentDocument()
    window.onDidChangeActiveTextEditor(() => this.loadCurrentDocument())
    window.onDidChangeTextEditorSelection(() => this.loadCurrentDocument())
  }

  loadCurrentDocument () {
    const editor = window.activeTextEditor

    if (!editor || !Global.isLanguageIdSupported(editor.document.languageId)) {
      commands.executeCommand('setContext', 'vue-i18n-ally-supported-file', false)
      this.includePaths = []
    }
    else {
      commands.executeCommand('setContext', 'vue-i18n-ally-supported-file', true)
      this.includePaths = KeyDetector.getKeyByContent(editor.document.getText())
    }

    this.refresh()
  }

  getRoots () {
    const roots = super.getRoots()
    const realPaths = roots.map(i => i.node.keypath)
    if (!this.includePaths)
      return roots

    // create shadow nodes
    const shadowPaths = this.includePaths
      .filter(path => !realPaths.includes(path))

    for (const keypath of shadowPaths) {
      let node = this.loader.getTreeNodeByKey(keypath)
      if (node && node.type === 'tree') {
        roots.push(new LocaleTreeView(this.ctx, node))
      }
      else {
        node = new LocaleNode({ keypath, shadow: true })
        roots.push(new LocaleTreeView(this.ctx, node))
      }
    }

    return this.sort(roots)
  }
}

const m: ExtensionModule = (ctx) => {
  const treeDataProvider = new FileLocalesTreeProvider(ctx)

  window.createTreeView('locales-tree-file', {
    treeDataProvider,
    // @ts-ignore
    showCollapseAll: true,
  })
  window.createTreeView('locales-tree-file-explorer', {
    treeDataProvider,
    // @ts-ignore
    showCollapseAll: true,
  })

  return []
}

export default m
