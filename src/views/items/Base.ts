import { ExtensionContext, TreeItem } from 'vscode'
import { getFlagFilename } from '../../utils/utils'

export abstract class BaseTreeItem extends TreeItem {
  constructor (
    public readonly ctx: ExtensionContext,
  ) {
    super('')
  }

  async getChildren (): Promise<BaseTreeItem[]> {
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

  getIcon (name: string) {
    return {
      light: this.ctx.asAbsolutePath(`res/light/${name}.svg`),
      dark: this.ctx.asAbsolutePath(`res/dark/${name}.svg`),
    }
  }

  getFlagIcon (locale: string) {
    return this.ctx.asAbsolutePath(`res/flags/${getFlagFilename(locale)}`)
  }
}
