import { workspace, commands, window, EventEmitter, Event, ExtensionContext, OutputChannel } from 'vscode'
import { LocaleLoader } from '.'
import { uniq } from 'lodash'
import { normalizeLocale, isVueI18nProject } from './utils'
import { JsonParser } from '../parsers/JsonParser'
import { YamlParser } from '../parsers/YamlParser'

const configPrefix = 'vue-i18n-ally'

export class Global {
  private static _loaders: Record<string, LocaleLoader> = {}
  private static _rootpath: string
  private static _channel: OutputChannel;
  private static _enabled: boolean = false
  static context: ExtensionContext
  static parsers = [new JsonParser(), new YamlParser()]

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
    context.subscriptions.push(window.onDidChangeTextEditorViewColumn(e => this.updateRootPath()))
    context.subscriptions.push(workspace.onDidOpenTextDocument(e => this.updateRootPath()))
    context.subscriptions.push(workspace.onDidCloseTextDocument(e => this.updateRootPath()))
    await this.updateRootPath()
    await this.initLoader(this._rootpath)
  }

  private static async initLoader (rootpath: string) {
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

    if (!editor || !workspace.workspaceFolders || workspace.workspaceFolders.length === 0) {
      rootpath = ''
    }
    else {
      const resource = editor.document.uri
      if (resource.scheme === 'file') {
        const folder = workspace.getWorkspaceFolder(resource)
        if (folder)
          rootpath = folder.uri.fsPath
      }
    }

    if (rootpath !== this._rootpath) {
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

  static get rootPath () {
    return this._rootpath || workspace.rootPath || ''
  }

  // languages
  static get displayLanguage (): string {
    return normalizeLocale(Global.getConfig('displayLanguage'))
  }

  static set displayLanguage (value) {
    Global.setConfig('displayLanguage', normalizeLocale(value))
  }

  static get sourceLanguage (): string {
    return normalizeLocale(Global.getConfig('sourceLanguage'), '') || this.displayLanguage || 'en'
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
}
