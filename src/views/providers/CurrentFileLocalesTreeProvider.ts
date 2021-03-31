import { ExtensionContext, window, TreeDataProvider, TreeItem, Event, EventEmitter } from 'vscode'
import { uniq } from 'lodash'
import { BaseTreeItem } from '../items/Base'
import { CurrentFileNotFoundItem } from '../items/CurrentFileNotFoundItem'
import { CurrentFileInUseItem } from '../items/CurrentFileInUseItem'
import { CurrentFileExtractionItem } from '../items/CurrentFileExtractionItem'
import { KeyDetector, Global, CurrentFile } from '~/core'
import { resolveFlattenRootKeypath } from '~/utils'

export class CurrentFileLocalesTreeProvider implements TreeDataProvider<BaseTreeItem> {
  protected name = 'CurrentFileLocalesTreeProvider'
  private _onDidChangeTreeData: EventEmitter<BaseTreeItem | undefined> = new EventEmitter<BaseTreeItem | undefined>()
  readonly onDidChangeTreeData: Event<BaseTreeItem | undefined> = this._onDidChangeTreeData.event

  public paths: string[] = []
  public pathsExists: string[] = []

  constructor(
    public ctx: ExtensionContext,
  ) {
    this.loadCurrentDocument()
    window.onDidChangeActiveTextEditor(() => this.loadCurrentDocument())
    window.onDidChangeTextEditorSelection(() => this.loadCurrentDocument())
  }

  getTreeItem(element: BaseTreeItem): TreeItem {
    return element
  }

  async getChildren(element?: BaseTreeItem) {
    if (element)
      return await element.getChildren()

    const items: BaseTreeItem[] = [
      new CurrentFileInUseItem(this),
      new CurrentFileNotFoundItem(this),
    ]

    const langId = window.activeTextEditor?.document.languageId
    if (langId && Global.getExtractionFrameworksByLang(langId).length)
      items.push(new CurrentFileExtractionItem(this))

    return items
  }

  protected refresh(): void {
    this._onDidChangeTreeData.fire(undefined)
  }

  loadCurrentDocument() {
    const editor = window.activeTextEditor

    if (!editor)
      return

    if (!Global.isLanguageIdSupported(editor.document.languageId))
      this.paths = []
    else
      this.paths = uniq(KeyDetector.getKeys(editor.document).map(i => i.key))

    this.updatePathsExists()
    this.refresh()
  }

  public get pathsInUse() {
    return this.paths.filter(i => this.pathsExists.includes(i))
  }

  public get pathsNotFound() {
    return this.paths.filter(i => !this.pathsExists.includes(i))
  }

  updatePathsExists() {
    const roots = Object.values(CurrentFile?.loader?.flattenLocaleTree || {})
    this.pathsExists = roots.map(i => resolveFlattenRootKeypath(i.keypath))
  }
}
