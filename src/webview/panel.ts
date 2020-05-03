import path from 'path'
import fs from 'fs'
import { WebviewPanel, Disposable, window, ViewColumn, Uri, ExtensionContext, workspace, EventEmitter, commands, Selection, TextEditorRevealType } from 'vscode'
import { TranslateKeys } from '../commands/manipulations'
import i18n from '../i18n'
import { Config, CurrentFile, Global, Commands, KeyInDocument, KeyDetector } from '../core'
import { EXT_EDITOR_ID, EXT_ID } from '../meta'

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
  private readonly _ctx: ExtensionContext
  private _disposables: Disposable[] = []
  private _pendingMessages: any[] = []
  private _editing_key: string | undefined
  private _mode: 'standalone' | 'currentFile' = 'standalone'
  public ready = false

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
          this.openKey(this._editing_key)
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
    this.postMessage({
      name: 'context',
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
      this.postMessage({
        name: 'route',
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

  private updateI18nMessages() {
    this.postMessage({
      name: 'i18n',
      data: i18n.messages,
    })
  }

  private updateConfig() {
    const locales = Global.loader?.locales || []
    this.postMessage({
      name: 'config',
      data: {
        debug: Config.debug,
        review: Config.reviewEnabled,
        locales,
        flags: locales.map(i => Config.tagSystem.getFlagName(i)),
        sourceLanguage: Config.sourceLanguage,
        displayLanguage: Config.displayLanguage,
        enabledFrameworks: Config.enabledFrameworks,
        ignoredLocales: Config.ignoredLocales,
        extensionRoot: this._panel.webview.asWebviewUri(Uri.file(Config.extensionPath!)).toString(),
        translateOverrideExisting: Config.translateOverrideExisting,
        user: Config.reviewUser,
      },
    })
  }

  private async handleMessage(message: any) {
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

      case 'navigate-key':
        this.navigateKey(message.data)
        break

      case 'translate':
        TranslateKeys(message.data)
        break

      case 'review.description':
        Global.reviews.promptEditDescription(message.keypath)
        break

      case 'review.comment':
        Global.reviews.addComment(message.keypath, message.locale, message.data)
        break

      case 'review.edit':
        Global.reviews.editComment(message.keypath, message.locale, message.data)
        break

      case 'review.resolve':
        Global.reviews.resolveComment(message.keypath, message.locale, message.comment)
        break

      case 'review.apply-suggestion':
        Global.reviews.applySuggestion(message.keypath, message.locale, message.comment)
        break

      case 'open-builtin-settings':
        commands.executeCommand('workbench.extensions.action.configure', EXT_ID)
        break

      case 'open-search':
        commands.executeCommand(Commands.open_editor)
        break

      case 'translation.apply':
        Global.reviews.applyTranslationCandidate(message.keypath, message.locale)
        break

      case 'translation.edit':
        Global.reviews.promptEditTranslation(message.keypath, message.locale)
        break

      case 'translation.discard':
        Global.reviews.discardTranslationCandidate(message.keypath, message.locale)
        break
    }
  }

  private async navigateKey(data: KeyInDocument & {filepath: string; keyIndex: number}) {
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
    this.ready = false
    this._panel.iconPath = Uri.file(
      path.join(this._ctx.extensionPath, 'res/logo.svg'),
    )
    this._panel.webview.html = fs.readFileSync(
      path.join(this._ctx.extensionPath, 'dist/editor/index.html'),
      'utf-8',
    )
    this.updateI18nMessages()
  }

  get visible() {
    return this._panel.visible
  }
}
