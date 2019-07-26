import { workspace, ExtensionContext, Uri, window } from 'vscode'
import { ComposedLoader } from './loaders/ComposedLoader'
import { Global } from './Global'
import { SFCLoader } from './loaders/SfcLoader'
import { Config } from './Config'
import { Loader } from '.'

export class CurrentFile {
  static _sfc_loader: SFCLoader | null = null
  static _composed_loader = new ComposedLoader()

  static watch (ctx: ExtensionContext) {
    ctx.subscriptions.push(workspace.onDidSaveTextDocument(e => this.update(e.uri)))
    ctx.subscriptions.push(window.onDidChangeActiveTextEditor(e => this.update(e && e.document.uri)))
    ctx.subscriptions.push(Global.onDidChangeLoader(() => {
      this.updateLoaders()
      this._composed_loader.fire('{Config}')
    }))
    this.update(window.activeTextEditor && window.activeTextEditor.document.uri)
    if (!Config.sfc)
      this.updateLoaders()
  }

  static update (uri?: Uri) {
    if (!Global.enabled)
      return
    if (!Config.sfc)
      return

    if (this._sfc_loader) {
      if (uri && this._sfc_loader.uri.path === uri.path) {
        this._sfc_loader.load()
        return
      }
      else {
        this._sfc_loader.dispose()
        this._sfc_loader = null
      }
    }
    if (uri && uri.fsPath.endsWith('.vue'))
      this._sfc_loader = new SFCLoader(uri)

    this.updateLoaders()
  }

  static updateLoaders () {
    const loaders: Loader[] = [Global.loader]
    if (this._sfc_loader)
      loaders.push(this._sfc_loader)
    this._composed_loader.loaders = loaders
  }

  static get loader () {
    return this._composed_loader
  }
}
