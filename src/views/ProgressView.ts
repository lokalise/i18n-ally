import { TreeItem, ExtensionContext, TreeDataProvider, EventEmitter, Event, window, TreeItemCollapsibleState } from 'vscode'
import { Coverage, Global, Config, Loader, CurrentFile } from '../core'
import { ExtensionModule } from '../modules'
import { unicodeProgressBar, decorateLocale, unicodeDecorate, Log } from '../utils'
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

export abstract class ProgressSubmenuView extends ProgressView {
  constructor (
    protected root: ProgressRootView,
    public readonly labelKey: i18nKeys,
  ) {
    super(root.ctx, root.node)
  }

  getLabel () {
    return i18n.t(this.labelKey) + this.getSuffix()
  }

  getSuffix () {
    return ` (${this.getItems().length})`
  }

  abstract getItems (): string[]

  async getChildren () {
    const locales = Array.from(new Set([this.node.locale, Config.displayLanguage]))

    return this.getItems()
      .map(key => CurrentFile.loader.getNodeByKey(key))
      .map(node => node && new LocaleTreeView(this.ctx, node, true, this.node.locale, locales))
      .filter(item => item) as LocaleTreeView[]
  }
}

export class ProgressMissingListView extends ProgressSubmenuView {
  constructor (
    protected root: ProgressRootView,
  ) {
    super(root, 'view.progress_submenu.missing_keys')
  }

  getItems () {
    return this.root.node.missingKeys
  }
}

export class ProgressTranslatedListView extends ProgressSubmenuView {
  constructor (
    protected root: ProgressRootView,
  ) {
    // @ts-ignore
    super(root, 'view.progress_submenu.translated_keys')
  }

  getItems () {
    return this.root.node.translatedKeys
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
    if (!this.visible)
      return this.getIcon('eye-off-fade')
    return this.getFlagIcon(this.node.locale)
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
