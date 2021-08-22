import path from 'path'
import fs from 'fs'
import { WebviewPanel, Disposable, window, ViewColumn, Uri, ExtensionContext, workspace, EventEmitter, Selection, TextEditorRevealType } from 'vscode'
import { EXT_EDITOR_ID } from '~/meta'
import { Protocol } from '~/protocol'
import i18n from '~/i18n'
import { CurrentFile, Global, KeyInDocument, KeyDetector, Config, Telemetry, TelemetryKey, ActionSource } from '~/core'

export class EditorContext {
  filepath?: string
  keys?: KeyInDocument[]
}

export class EditorPanel {
  /**
   * Track the currently panel. Only allow a single panel to exist at a time.
   */
  public static currentPanel: EditorPanel | undefined
  private static _onDidChanged = new EventEmitter<boolean>()
  public static onDidChange = EditorPanel._onDidChanged.event

  private readonly _panel: WebviewPanel
  private readonly _protocol: Protocol
  private readonly _ctx: ExtensionContext
  private _disposables: Disposable[] = []
  private _editing_key: string | undefined
  private _mode: 'standalone' | 'currentFile' = 'standalone'

  get mode() {
    return this._mode
  }

  set mode(v) {
    if (this._mode !== v)
      this._mode = v
  }

  public static createOrShow(ctx: ExtensionContext, column?: ViewColumn) {
    const panel = this.revive(ctx, undefined, column)
    panel.reveal(column || panel._panel.viewColumn)
    return panel
  }

  public static revive(ctx: ExtensionContext, panel?: WebviewPanel, column?: ViewColumn) {
    if (!EditorPanel.currentPanel) {
      EditorPanel.currentPanel = new EditorPanel(ctx, panel, column)
      EditorPanel._onDidChanged.fire(true)
    }

    return EditorPanel.currentPanel
  }

  private constructor(ctx: ExtensionContext, panel?: WebviewPanel, column?: ViewColumn) {
    this._ctx = ctx
    this._panel = panel || window.createWebviewPanel(
      EXT_EDITOR_ID,
      i18n.t('editor.title'),
      column || ViewColumn.Active,
      {
        enableScripts: true,
        localResourceRoots: [
          Uri.file(path.join(this._ctx.extensionPath, 'res')),
        ],
        retainContextWhenHidden: true,
      },
    )

    const webview = this._panel.webview

    this._protocol = new Protocol(
      async(message) => {
        if (message.type === 'switch-to')
          this.openKey(message.keypath!)
        else
          this._panel.webview.postMessage(message)
      },
      async(message) => {
        switch (message.type) {
          case 'webview.refresh':
            this.init()
            break
          case 'navigate-key':
            this.navigateKey(message.data)
            break
        }
        return undefined
      },
      {
        get extendConfig() {
          return {
            extensionRoot: webview.asWebviewUri(Uri.file(Config.extensionPath!)).toString(),
          }
        },
      },
    )

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programatically
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables)

    // Handle messages from the webview
    this._panel.webview.onDidReceiveMessage(
      msg => this._protocol.handleMessages(msg),
      null,
      this._disposables,
    )

    CurrentFile.loader.onDidChange(
      () => {
        if (this._editing_key)
          this.openKey(this._editing_key)
      },
      null,
      this._disposables,
    )

    workspace.onDidChangeConfiguration(
      () => this._protocol.updateConfig(),
      null,
      this._disposables,
    )

    Global.reviews.onDidChange(
      (keypath?: string) => {
        if (this._editing_key && (!keypath || this._editing_key === keypath))
          this.openKey(this._editing_key)
      },
      null,
      this._disposables,
    )

    this.init()
  }

  private reveal(column?: ViewColumn) {
    column = column || (
      window.activeTextEditor
        ? window.activeTextEditor.viewColumn
        : undefined
    )
    this._panel.reveal(column)
  }

  public setContext(context: EditorContext = {}) {
    this._protocol.postMessage({
      type: 'context',
      data: context,
    })
  }

  public sendCurrentFileContext() {
    if (this.mode === 'standalone')
      this.setContext({})

    const doc = window.activeTextEditor?.document

    if (!doc || !Global.isLanguageIdSupported(doc.languageId))
      return false

    let keys = KeyDetector.getKeys(doc) || []
    if (!keys.length)
      return false

    keys = keys.map(k => ({
      ...k,
      value: CurrentFile.loader.getValueByKey(k.key),
    }))

    const context = {
      filepath: doc.uri.fsPath,
      keys,
    }

    this.setContext(context)
    return true
  }

  public openKey(keypath: string, locale?: string, index?: number) {
    const node = CurrentFile.loader.getNodeByKey(keypath, true)
    if (node) {
      this._editing_key = keypath
      this._protocol.postMessage({
        type: 'route',
        route: 'open-key',
        data: {
          locale,
          keypath,
          records: CurrentFile.loader.getShadowLocales(node),
          reviews: Global.reviews.getReviews(keypath),
          keyIndex: index,
        },
      })
      this.sendCurrentFileContext()
    }
    else {
      // TODO: Error
    }
  }

  async navigateKey(data: KeyInDocument & {filepath: string; keyIndex: number}) {
    Telemetry.track(TelemetryKey.GoToKey, { source: ActionSource.UiEditor })

    if (!data.filepath)
      return

    this.openKey(data.key, undefined, data.keyIndex)
    const doc = await workspace.openTextDocument(Uri.file(data.filepath))
    const editor = await window.showTextDocument(doc, ViewColumn.One)
    editor.selection = new Selection(
      doc.positionAt(data.end),
      doc.positionAt(data.start),
    )
    editor.revealRange(editor.selection, TextEditorRevealType.InCenter)
  }

  public dispose() {
    EditorPanel.currentPanel = undefined

    this._panel.dispose()

    Disposable.from(...this._disposables).dispose()

    EditorPanel._onDidChanged.fire(false)
  }

  init() {
    this._panel.iconPath = Uri.file(
      path.join(this._ctx.extensionPath, 'res/logo.svg'),
    )
    this._panel.webview.html = fs.readFileSync(
      path.join(this._ctx.extensionPath, 'dist/editor/index.html'),
      'utf-8',
    )
    this._protocol.updateI18nMessages()
  }

  get visible() {
    return this._panel.visible
  }
}
