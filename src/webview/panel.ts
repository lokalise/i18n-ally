import path from 'path'
import fs from 'fs'
import { WebviewPanel, Disposable, window, ViewColumn, Uri, ExtensionContext, workspace, EventEmitter } from 'vscode'
import { TranslateKeys } from '../commands/manipulations'
import i18n from '../i18n'
import { Config, CurrentFile, Global } from '../core'

interface EditorPanelOptions {
}

export class EditorPanel {
  /**
   * Track the currently panel. Only allow a single panel to exist at a time.
   */
  public static currentPanel: EditorPanel | undefined
  public static readonly viewType = 'i18n-ally-editor'
  private static _onDidChanged = new EventEmitter<boolean>()
  public static onDidChange = EditorPanel._onDidChanged.event

  private readonly _panel: WebviewPanel
  private readonly _ctx: ExtensionContext
  private _disposables: Disposable[] = []
  private _pendingMessages: any[] = []
  private _editing_key: string | undefined
  public options: EditorPanelOptions
  public ready = false

  public static createOrShow(ctx: ExtensionContext, options: EditorPanelOptions, column?: ViewColumn) {
    const panel = this.revive(ctx, options)
    panel.reveal(column)
    return panel
  }

  public static revive(ctx: ExtensionContext, options: EditorPanelOptions, panel?: WebviewPanel) {
    if (!EditorPanel.currentPanel) {
      EditorPanel.currentPanel = new EditorPanel(ctx, options, panel)
      EditorPanel._onDidChanged.fire(true)
    }

    return EditorPanel.currentPanel
  }

  private constructor(ctx: ExtensionContext, options: EditorPanelOptions, panel?: WebviewPanel) {
    this.options = options
    this._ctx = ctx
    this._panel = panel || window.createWebviewPanel(
      EditorPanel.viewType,
      i18n.t('editor.title'),
      ViewColumn.Active,
      {
        enableScripts: true,
        localResourceRoots: [
          Uri.file(path.join(this._ctx.extensionPath, 'res')),
        ],
      },
    )

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programatically
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables)

    // Handle messages from the webview
    this._panel.webview.onDidReceiveMessage(
      this.handleMessage.bind(this),
      null,
      this._disposables,
    )

    CurrentFile.loader.onDidChange(
      () => {
        if (this._editing_key)
          this.editKey(this._editing_key)
      },
      null,
      this._disposables,
    )

    workspace.onDidChangeConfiguration(
      () => this.updateConfig(),
      null,
      this._disposables,
    )

    Global.reviews.onDidChange(
      (keypath: string) => {
        if (keypath && keypath === this._editing_key)
          this.editKey(this._editing_key)
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

  public editKey(keypath: string) {
    const node = CurrentFile.loader.getNodeByKey(keypath)
    if (node) {
      this._editing_key = keypath
      this.postMessage({
        name: 'route',
        route: 'edit-key',
        data: {
          keypath,
          records: CurrentFile.loader.getShadowLocales(node),
          reviews: Global.reviews.getReviews(keypath),
        },
      })
    }
    else {
      // TODO: Error
    }
  }

  private updateConfig() {
    this.postMessage({
      name: 'config',
      data: {
        locales: Global.loader?.locales || [],
        sourceLanguage: Config.sourceLanguage,
        displayLanguage: Config.displayLanguage,
        enabledFrameworks: Config.enabledFrameworks,
        ignoredLocales: Config.ignoredLocales,
        extensionRoot: this._panel.webview.asWebviewUri(Uri.file(Config.extensionPath!)).toString(),
      },
    })
  }

  private async handleMessage(message: any) {
    console.log('i18n-ally-editor', message)
    switch (message.name) {
      case 'ready':
        this.ready = true
        this.postMessage({ name: 'ready' })
        this.updateConfig()
        break
      case 'refresh':
        this.init()
        break
      case 'edit':
        CurrentFile.loader.write({
          keypath: message.data.keypath,
          locale: message.data.locale,
          value: message.data.value,
        })
        break
      case 'translate':
        TranslateKeys(message.data)
        break
      case 'review':
        if (message.field === 'description') {
          const value = await window.showInputBox({
            value: Global.reviews.getDescription(message.keypath),
            prompt: `Description for "${message.keypath}"`,
          })
          if (value !== undefined)
            Global.reviews.setDescription(message.keypath, value)
        }
    }
  }

  private postMessage(message?: any) {
    if (message)
      this._pendingMessages.push(message)

    if (this.ready && this._pendingMessages.length) {
      for (const m of this._pendingMessages)
        this._panel.webview.postMessage(m)
      this._pendingMessages = []
    }
  }

  public dispose() {
    EditorPanel.currentPanel = undefined

    this._panel.dispose()

    Disposable.from(...this._disposables).dispose()

    EditorPanel._onDidChanged.fire(false)
  }

  private init() {
    this._panel.iconPath = Uri.file(
      path.join(this._ctx.extensionPath, 'res/logo.svg'),
    )
    this._panel.webview.html = fs.readFileSync(
      path.join(this._ctx.extensionPath, 'dist/editor/index.html'),
      'utf-8',
    )
  }

  get visible() {
    return this._panel.visible
  }
}
