import { workspace, commands, window, EventEmitter, Event, ExtensionContext, OutputChannel } from 'vscode'
import { LocaleLoader } from '.'
import { uniq } from 'lodash'
import { normalizeLocale, isVueI18nProject } from './utils'
import { JsonParser } from '../parsers/JsonParser'
import { YamlParser } from '../parsers/YamlParser'
import { JavascriptParser } from '../parsers/JavascriptParser'
import { AutoDetectLocales } from '../commands/configLocalesAuto'
import { extname } from 'path'

const configPrefix = 'vue-i18n-ally'

export class Global {
  private static _loaders: Record<string, LocaleLoader> = {}
  private static _rootpath: string
  private static _channel: OutputChannel;
  private static _enabled: boolean = false
  static context: ExtensionContext
  static parsers = [
    new JsonParser(),
    new YamlParser(),
    new JavascriptParser(),
  ]

  // events
  private static _onDidChangeRootPath: EventEmitter<string> = new EventEmitter()
  static readonly onDidChangeRootPath: Event<string> = Global._onDidChangeRootPath.event
  private static _onDidChangeEnabled: EventEmitter<boolean> = new EventEmitter()
  static readonly onDidChangeEnabled: Event<boolean> = Global._onDidChangeEnabled.event
  private static _onDidChangeLoader: EventEmitter<LocaleLoader> = new EventEmitter()
  static readonly onDidChangeLoader: Event<LocaleLoader> = Global._onDidChangeLoader.event

  static async init (context: ExtensionContext) {
    this.context = context

    context.subscriptions.push(workspace.onDidChangeWorkspaceFolders(e => this.updateRootPath()))
    context.subscriptions.push(window.onDidChangeActiveTextEditor(e => this.updateRootPath()))
    context.subscriptions.push(workspace.onDidOpenTextDocument(e => this.updateRootPath()))
    context.subscriptions.push(workspace.onDidCloseTextDocument(e => this.updateRootPath()))
    // TODO: if not locales set, disabled this plugin
    // TODO: watch on config change
    new AutoDetectLocales(context).init()
    await this.updateRootPath()
    if (this.enabled)
      await this.initLoader(this._rootpath)
  }

  private static async initLoader (rootpath: string) {
    if (!rootpath)
      return

    if (this._loaders[rootpath])
      return this._loaders[rootpath]

    this.outputChannel.appendLine(`Init loader "${rootpath}"`)
    const loader = new LocaleLoader(rootpath)
    await loader.init()
    this.context.subscriptions.push(loader.onDidChange(() => this._onDidChangeLoader.fire(loader)))
    this.context.subscriptions.push(loader)
    this._loaders[rootpath] = loader

    return this._loaders[rootpath]
  }

  private static async updateRootPath () {
    const editor = window.activeTextEditor
    let rootpath = ''

    if (!editor || !workspace.workspaceFolders || workspace.workspaceFolders.length === 0)
      return

    const resource = editor.document.uri
    if (resource.scheme === 'file') {
      const folder = workspace.getWorkspaceFolder(resource)
      if (folder)
        rootpath = folder.uri.fsPath
    }

    if (!rootpath && workspace.rootPath)
      rootpath = workspace.rootPath

    if (rootpath && rootpath !== this._rootpath) {
      this._rootpath = rootpath
      const shouldEnabled = isVueI18nProject(rootpath)
      this.outputChannel.appendLine(`\n----\nWorkspace root changed to "${rootpath}"`)
      this.setEnabled(shouldEnabled)
      if (shouldEnabled)
        await this.initLoader(rootpath)
      else
        this.outputChannel.appendLine('Workspace is not a vue-i18n project, extension disabled')
      this._onDidChangeRootPath.fire(rootpath)
      this._onDidChangeLoader.fire(this.loader)
    }
  }

  static get loader () {
    return this._loaders[this._rootpath]
  }

  static getMatchedParser (ext: string) {
    if (!ext.startsWith('.'))
      ext = extname(ext)
    return this.parsers.find(parser => parser.supports(ext))
  }

  static get outputChannel (): OutputChannel {
    if (!this._channel)
      this._channel = window.createOutputChannel('Vue i18n Ally')
    return this._channel
  }

  // enables
  static get enabled () {
    return this._enabled
  }

  private static setEnabled (value: boolean) {
    if (this._enabled !== value) {
      this._enabled = value
      commands.executeCommand('setContext', 'vue-i18n-ally-enabled', value)
      this._onDidChangeEnabled.fire()
    }
  }

  // #region ====== Configurations ======

  static get allLocales () {
    return this.loader.locales
  }

  static get visibleLocales () {
    return this.getVisibleLocales(this.allLocales)
  }

  static getVisibleLocales (locales: string[]) {
    const ignored = this.ignoredLocales
    return locales.filter(locale => !ignored.includes(locale))
  }

  // languages
  static get displayLanguage (): string {
    return normalizeLocale(Global.getConfig('displayLanguage'))
  }

  static set displayLanguage (value) {
    Global.setConfig('displayLanguage', normalizeLocale(value), true)
    this._onDidChangeLoader.fire(this.loader)
  }

  static get sourceLanguage (): string {
    return normalizeLocale(Global.getConfig('sourceLanguage'), '') || this.displayLanguage || 'en'
  }

  static set sourceLanguage (value) {
    Global.setConfig('sourceLanguage', normalizeLocale(value))
    this._onDidChangeLoader.fire(this.loader)
  }

  static get ignoredLocales (): string[] {
    const ignored = Global.getConfig('ignoredLocales')
    if (!ignored)
      return []
    if (ignored && typeof ignored === 'string')
      return [ignored]
    if (Array.isArray(ignored))
      return ignored
    return []
  }

  static set ignoredLocales (value) {
    Global.setConfig('ignoredLocales', value, true)
    this._onDidChangeLoader.fire(this.loader)
  }

  static toggleLocaleVisibility (locale: string, visible?: boolean) {
    const ignored = this.ignoredLocales
    if (visible == null)
      visible = !ignored.includes(locale)
    if (!visible) {
      ignored.push(locale)
      this.ignoredLocales = ignored
    }
    else {
      this.ignoredLocales = ignored.filter(i => i !== locale)
    }
  }

  // locales
  static get localesPaths (): string[] {
    const paths = Global.getConfig('localesPaths')
    return paths ? paths.split(',') : []
  }

  static set localesPaths (paths: string[]) {
    Global.setConfig('localesPaths', paths.join(','))
  }

  static updateLocalesPaths (paths: string[]) {
    this.localesPaths = uniq(Global.localesPaths.concat(paths))
  }

  static get hasLocalesConfigured () {
    return !!this.localesPaths.length
  }

  // config
  private static getConfig (key: string): any {
    return workspace
      .getConfiguration()
      .get(`${configPrefix}.${key}`)
  }

  private static setConfig (key: string, value: any, isGlobal = false) {
    return workspace
      .getConfiguration()
      .update(`${configPrefix}.${key}`, value, isGlobal)
  }

  // #endregion
}
