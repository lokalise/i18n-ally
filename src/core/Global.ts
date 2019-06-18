import { workspace, commands, window, EventEmitter, Event, ExtensionContext, OutputChannel } from 'vscode'
import { LocaleLoader } from '.'
import { uniq } from 'lodash'
import { normalizeLocale, isVueI18nProject } from '../utils/utils'
import { JsonParser } from '../parsers/JsonParser'
import { YamlParser } from '../parsers/YamlParser'
import { JavascriptParser } from '../parsers/JavascriptParser'
import { ConfigLocalesGuide } from '../commands/configLocales'
import { extname } from 'path'
import i18n from '../i18n'

const configPrefix = 'vue-i18n-ally'
export type KeyStyle = 'auto' | 'nested' | 'flat'

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
    context.subscriptions.push(workspace.onDidChangeConfiguration(e => this.update()))
    await this.updateRootPath()
  }

  private static async initLoader (rootpath: string) {
    if (!rootpath)
      return

    if (this._loaders[rootpath])
      return this._loaders[rootpath]

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
      this.outputChannel.appendLine(`\n----\nWorkspace root changed to "${rootpath}"`)
      await this.update()
      this._onDidChangeRootPath.fire(rootpath)
    }
  }

  private static async update () {
    const i18nProject = isVueI18nProject(this._rootpath)
    const hasLocalesSet = !!this.localesPaths.length
    const shouldEnabled = i18nProject && hasLocalesSet
    this.setEnabled(shouldEnabled)
    if (this.enabled) {
      await this.initLoader(this._rootpath)
    }
    else {
      if (!i18nProject)
        this.outputChannel.appendLine('Current workspace is not a vue-i18n project, extension disabled')
      else if (!hasLocalesSet)
        this.outputChannel.appendLine('No locales path found, extension disabled')

      if (i18nProject && !hasLocalesSet)
        ConfigLocalesGuide.autoSet()

      this.unloadAll()
    }

    this._onDidChangeLoader.fire(this.loader)
  }

  private static unloadAll () {
    Object.values(this._loaders).forEach(loader => loader.dispose())
    this._loaders = {}
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
      this.outputChannel.appendLine(value ? 'Enabled' : 'Disabled')
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

  static get keyStyle (): KeyStyle {
    return (Global.getConfig('keystyle') || 'auto') as KeyStyle
  }

  static set keyStyle (value: KeyStyle) {
    Global.setConfig('keystyle', value, false)
  }

  static async requestKeyStyle (): Promise<KeyStyle | undefined> {
    if (this.keyStyle !== 'auto')
      return this.keyStyle

    const result = await window.showQuickPick([{
      value: 'nested',
      label: i18n.t('prompt.keystyle_nested'),
      description: i18n.t('prompt.keystyle_nested_example'),
    }, {
      value: 'flat',
      label: i18n.t('prompt.keystyle_flat'),
      description: i18n.t('prompt.keystyle_flat_example'),
    }], {
      placeHolder: i18n.t('prompt.keystyle_select'),
    })

    if (!result) {
      this.keyStyle = 'nested'
      return 'nested'
    }
    this.keyStyle = result.value as KeyStyle
    return result.value as KeyStyle
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
    if (typeof paths === 'string')
      return paths.split(',')
    return paths || []
  }

  static set localesPaths (paths: string[]) {
    if (paths.length === 1)
      Global.setConfig('localesPaths', paths[0])
    else
      Global.setConfig('localesPaths', paths)
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
