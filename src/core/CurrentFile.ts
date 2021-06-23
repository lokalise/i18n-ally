import { workspace, ExtensionContext, Uri, window, EventEmitter } from 'vscode'
import { ComposedLoader } from './loaders/ComposedLoader'
import { Global } from './Global'
import { VueSfcLoader } from './loaders/VueSfcLoader'
import { Loader, Analyst } from '.'
import { DetectHardStrings } from '~/commands/detectHardStrings'
import { DetectionResult } from '~/core/types'

export class CurrentFile {
  static _vue_sfc_loader: VueSfcLoader | null = null
  static _composed_loader = new ComposedLoader()
  static _onInvalidate = new EventEmitter<boolean>()
  static _onHardStringDetected = new EventEmitter<DetectionResult[] | undefined>()

  static onInvalidate = CurrentFile._onInvalidate.event
  static onHardStringDetected = CurrentFile._onHardStringDetected.event

  static get VueSfc() {
    return Global.hasFeatureEnabled('VueSfc')
  }

  static watch(ctx: ExtensionContext) {
    ctx.subscriptions.push(workspace.onDidSaveTextDocument(e => this.update(e.uri)))
    ctx.subscriptions.push(workspace.onDidChangeTextDocument(e => this.update(e.document.uri)))
    ctx.subscriptions.push(window.onDidChangeActiveTextEditor(e => this.update(e && e.document.uri)))
    ctx.subscriptions.push(Global.onDidChangeLoader(() => {
      this.invalidate()
      this.updateLoaders()
      this._composed_loader.fire('{Config}')
    }))
    ctx.subscriptions.push(Analyst.watch())
    this.update(window.activeTextEditor && window.activeTextEditor.document.uri)
    this.updateLoaders()
  }

  static update(uri?: Uri) {
    if (!Global.enabled)
      return

    this.invalidate()
    if (this.VueSfc) {
      if (this._vue_sfc_loader) {
        if (uri && this._vue_sfc_loader.uri.path === uri.path) {
          this._vue_sfc_loader.load()
          return
        }
        else {
          this._vue_sfc_loader.dispose()
          this._vue_sfc_loader = null
        }
      }
      if (uri && uri.fsPath.endsWith('.vue'))
        this._vue_sfc_loader = new VueSfcLoader(uri)
    }

    this.updateLoaders()
  }

  static updateLoaders() {
    const loaders: Loader[] = [Global.loader]

    if (this.VueSfc && this._vue_sfc_loader)
      loaders.push(this._vue_sfc_loader)

    this._composed_loader.loaders = loaders
  }

  static get loader() {
    return this._composed_loader
  }

  static invalidate() {
    this.hardStrings = undefined
    this._onInvalidate.fire(true)
  }

  static hardStrings: DetectionResult[] | undefined

  static async detectHardStrings(force = false) {
    if (!this.hardStrings || force)
      this.hardStrings = await DetectHardStrings()
    this._onHardStringDetected.fire(this.hardStrings)
    return this.hardStrings
  }
}
