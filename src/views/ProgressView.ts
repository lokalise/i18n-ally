import { TreeItem, ExtensionContext, TreeDataProvider, EventEmitter, Event, window } from 'vscode'
import { LocaleLoader, Coverage, Global, Config } from '../core'
import { ExtensionModule } from '../modules'
import { unicodeProgressBar, decorateLocale, unicodeDecorate } from '../utils'

export class ProgressItem extends TreeItem {
  constructor (
    private ctx: ExtensionContext,
    public readonly node: Coverage
  ) {
    super(decorateLocale(node.locale))
  }

  get description (): string {
    const rate = this.node.translated / this.node.total
    const percent = +(rate * 100).toFixed(1)
    const progress = unicodeProgressBar(Math.round(percent))
    let description = `${progress}  ${percent}%  (${this.node.translated}/${this.node.total})`
    if (this.isSource)
      description += unicodeDecorate('  source', 'regional_indicator')
    else if (this.isDisplay)
      description += unicodeDecorate('  display', 'regional_indicator')
    return description
  }

  get visible () {
    return !Config.ignoredLocales.includes(this.node.locale)
  }

  get isSource () {
    return this.node.locale === Config.sourceLanguage
  }

  get isDisplay () {
    return this.node.locale === Config.displayLanguage
  }

  get iconPath () {
    if (!this.visible) {
      return {
        light: this.ctx.asAbsolutePath('res/light/eye-off-fade.svg'),
        dark: this.ctx.asAbsolutePath('res/dark/eye-off-fade.svg'),
      }
    }
    return this.ctx.asAbsolutePath(`res/flags/${this.node.locale.toLocaleLowerCase()}.svg`)
  }

  get contextValue () {
    const context = ['progress']

    if (!this.isSource)
      context.push('notsource')

    if (!this.isDisplay)
      context.push('notdisply')

    if (!this.visible)
      context.push('show')
    else if (!this.isDisplay) // should not hide if it's displaying
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
