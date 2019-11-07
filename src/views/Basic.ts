import { ExtensionContext, TreeItem } from 'vscode'

export abstract class BasicTreeView extends TreeItem {
  constructor (
    public readonly ctx: ExtensionContext,
  ) {
    super('')
  }

  async getChildren (): Promise<BasicTreeView[]> {
    return []
  }

  protected getLabel () {
    return ''
  }

  protected setLabel (value: string) {}

  get label () {
    return this.getLabel()
  }

  set label (v) {
    this.setLabel(v)
  }
}
