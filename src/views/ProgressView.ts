import { TreeItem, ExtensionContext, TreeDataProvider, EventEmitter, Event, window, TreeItemCollapsibleState } from 'vscode'
import { Coverage, Global, Config, Loader, CurrentFile } from '../core'
import { ExtensionModule } from '../modules'
import { unicodeProgressBar, decorateLocale, unicodeDecorate, Log, getFlagFilename } from '../utils'
import { notEmpty } from '../utils/utils'
import i18n, { i18nKeys } from '../i18n'
import { BasicTreeView } from './Basic'
import { LocaleTreeView } from './LocalesTreeView'

export abstract class ProgressView extends BasicTreeView {
  constructor (
    public readonly ctx: ExtensionContext,
    public readonly node: Coverage
  ) {
    super(ctx)
  }

  getLabel () {
    return decorateLocale(this.node.locale)
  }

  collapsibleState = TreeItemCollapsibleState.Collapsed
}

export class ProgressSubmenuView extends ProgressView {
  constructor (
    protected root: ProgressRootView,
    public readonly labelKey: i18nKeys,
    public suffix: string = ''
  ) {
    super(root.ctx, root.node)
  }

  get label () {
    return i18n.t(this.labelKey) + this.suffix
  }

  set label (_) {}
}

export class ProgressMissingKeyView extends ProgressView {
  constructor (
    protected root: ProgressRootView,
    public readonly key: string,
  ) {
    super(root.ctx, root.node)
  }

  get label () {
    return this.key
  }

  set label (_) {}
}

export class ProgressMissingListView extends ProgressSubmenuView {
  constructor (
    protected root: ProgressRootView,
  ) {
    super(root, 'view.progress_submenu.missing_keys', ` (${root.node.missing})`)
  }

  async getChildren () {
    return this.root.node.missingKeys
      .map(key => CurrentFile.loader.getNodeByKey(key))
      .map(node => node && new LocaleTreeView(this.ctx, node, true))
      .filter(item => item) as LocaleTreeView[]
  }
}

export class ProgressTranslatedListView extends ProgressSubmenuView {
  constructor (
    protected root: ProgressRootView,
  ) {
    super(root, 'view.progress_submenu.missing_keys', ` (${root.node.translated})`)
  }

  async getChildren () {
    return this.root.node.translatedKeys
      .map(key => CurrentFile.loader.getNodeByKey(key))
      .map(node => node && new LocaleTreeView(this.ctx, node))
      .filter(item => item) as LocaleTreeView[]
  }
}

export class ProgressRootView extends ProgressView {
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
    return this.ctx.asAbsolutePath(`res/flags/${getFlagFilename(this.node.locale)}`)
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

  async getChildren () {
    return [
      new ProgressTranslatedListView(this),
      new ProgressMissingListView(this),
    ]
  }
}

export class ProgressProvider implements TreeDataProvider<BasicTreeView> {
  protected name = 'ProgressProvider'
  private _onDidChangeTreeData: EventEmitter<BasicTreeView | undefined> = new EventEmitter<BasicTreeView | undefined>()
  readonly onDidChangeTreeData: Event<BasicTreeView | undefined> = this._onDidChangeTreeData.event
  private loader: Loader

  constructor (
    private ctx: ExtensionContext,
  ) {
    this.loader = CurrentFile.loader

    let count = 0
    this.loader.onDidChange((src) => {
      Log.info(`♨ ${this.name} Updated (${count++}) ${src}`)
      this.refresh()
    })
  }

  refresh (): void {
    this._onDidChangeTreeData.fire()
  }

  getTreeItem (element: BasicTreeView): TreeItem {
    return element
  }

  async getChildren (element?: BasicTreeView) {
    if (element)
      return await element.getChildren()

    return Object.values(Global.allLocales)
      .map(node => this.loader.getCoverage(node))
      .filter(notEmpty)
      .map(cov => new ProgressRootView(this.ctx, cov))
  }
}

const m: ExtensionModule = (ctx: ExtensionContext) => {
  const provider = new ProgressProvider(ctx)
  return window.registerTreeDataProvider('locales-progress', provider)
}

export default m
