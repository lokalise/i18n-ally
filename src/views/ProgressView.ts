import { LocaleLoader, Coverage, Global, unicodeProgress } from '../core'
import { ExtensionModule } from '../modules'
import { TreeItem, ExtensionContext, TreeDataProvider, EventEmitter, Event, window } from 'vscode'

export class ProgressItem extends TreeItem {
  constructor (
    private ctx: ExtensionContext,
    public readonly node: Coverage
  ) {
    super(node.locale)
  }

  get description (): string {
    const rate = this.node.translated / this.node.total
    const progress = unicodeProgress(rate, 8)
    const percent = (rate * 100).toFixed(2)
    return `${progress} ${percent}%  (${this.node.translated}/${this.node.total})`
  }

  get visible () {
    return !Global.ignoredLocales.includes(this.node.locale)
  }

  get iconPath () {
    if (!this.visible)
      return this.ctx.asAbsolutePath('static/icon-eye-off.svg')
    return this.ctx.asAbsolutePath(`static/flags/${this.node.locale.toLocaleLowerCase()}.svg`)
  }

  get contextValue () {
    const context = ['progress']

    if (this.node.locale !== Global.sourceLanguage)
      context.push('notsource')

    if (this.node.locale !== Global.displayLanguage)
      context.push('notdisply')

    if (!this.visible)
      context.push('show')
    else if (this.node.locale !== Global.displayLanguage)
      context.push('hide')

    return context.join('-')
  }
}

export class ProgressProvider implements TreeDataProvider<ProgressItem> {
  private _onDidChangeTreeData: EventEmitter<ProgressItem | undefined> = new EventEmitter<ProgressItem | undefined>();
  readonly onDidChangeTreeData: Event<ProgressItem | undefined> = this._onDidChangeTreeData.event;
  private loader: LocaleLoader

  constructor (
    private ctx: ExtensionContext,
  ) {
    this.loader = Global.loader
    Global.onDidChangeLoader((loader) => {
      this.loader = loader
      this.refresh()
    })
  }

  refresh (): void {
    this._onDidChangeTreeData.fire()
  }

  getTreeItem (element: ProgressItem): TreeItem {
    return element
  }

  async getChildren (element?: ProgressItem) {
    if (element)
      return [] // no child

    return Object.values(Global.allLocales)
      .map(node => new ProgressItem(this.ctx, this.loader.getCoverage(node)))
  }
}

const m: ExtensionModule = (ctx: ExtensionContext) => {
  const provider = new ProgressProvider(ctx)
  return window.registerTreeDataProvider('locales-progress', provider)
}

export default m
