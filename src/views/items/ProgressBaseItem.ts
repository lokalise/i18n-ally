import { ExtensionContext, TreeItemCollapsibleState } from 'vscode'
import { Coverage } from '../../core'
import { decorateLocale } from '../../utils'
import { BaseTreeItem } from './Base'

export abstract class ProgressBaseItem extends BaseTreeItem {
  constructor(public readonly ctx: ExtensionContext, public readonly node: Coverage) {
    super(ctx)
  }

  getLabel() {
    return decorateLocale(this.node.locale)
  }

  collapsibleState = TreeItemCollapsibleState.Collapsed
}
