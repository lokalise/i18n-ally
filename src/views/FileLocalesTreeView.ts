import { ExtensionContext, window } from 'vscode'
import { LocalesTreeProvider } from './LocalesTreeView'
import { KeyDetector } from '../core'
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
}

const m: ExtensionModule = (ctx) => {
  const provider = new FileLocalesTreeProvider(ctx)

  return window.registerTreeDataProvider('locales-tree-file', provider)
}

export default m
