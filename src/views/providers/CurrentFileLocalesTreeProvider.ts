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

  private _pathsNotFound: string[] = []
  private _pathsInUse: string[] = []
  public paths: string[] = []
  public pathsExists: string[] = []

  constructor(
    public ctx: ExtensionContext,
  ) {
    this.loadCurrentDocument()

    CurrentFile.onInvalidate(() => this.loadCurrentDocument())
    CurrentFile.onHardStringDetected(() => this.refresh())
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
      new CurrentFileExtractionItem(this),
    ]

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
    return this._pathsInUse
  }

  public get pathsNotFound() {
    return this._pathsNotFound
  }

  updatePathsExists() {
    const roots = Object.values(CurrentFile?.loader?.flattenLocaleTree || {})
    this.pathsExists = roots.map(i => resolveFlattenRootKeypath(i.keypath))
    this._pathsInUse = this.paths.filter(i => this.pathsExists.includes(i))
    this._pathsNotFound = this.paths.filter(i => !this.pathsExists.includes(i))

    // for paths not found, we want to exclude derived keys
    // (derived keys are keys that are not actually in use, but are derived from a source key)
    // (derived keys are not considered "not found")
    const rules = Global.derivedKeyRules
    for (let i = 0; i < this.pathsExists.length && this._pathsNotFound.length > 0; i++) {
      const key = this.pathsExists[i]
      for (const r of rules) {
        const match = r.exec(key)
        if (match && match[1] && this._pathsNotFound.includes(match[1])) {
          this._pathsNotFound.splice(this._pathsNotFound.indexOf(match[1]), 1)
          this._pathsInUse.push(match[1])
          break
        }
      }
    }
  }
}
