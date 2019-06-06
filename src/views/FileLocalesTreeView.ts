import { ExtensionContext, window, commands } from 'vscode'
import { LocalesTreeProvider } from './LocalesTreeView'
import { KeyDetector, LocaleNode } from '../core'
import { ExtensionModule } from '../modules'
import { isSupported } from '../core/SupportedLanguageIds'
import { sortBy } from 'lodash'

export class FileLocalesTreeProvider extends LocalesTreeProvider {
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

    if (!editor || !isSupported(editor.document.languageId)) {
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
      const node = new LocaleNode(keypath, {}, true)
      roots.push(this.newItem(node))
    }

    sortBy(roots, 'keypath')

    return roots
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
