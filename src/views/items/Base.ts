import { ExtensionContext, TreeItem } from 'vscode'
import { Config } from '~/core'

export abstract class BaseTreeItem extends TreeItem {
  private _label = ''

  constructor(
    public readonly ctx: ExtensionContext,
  ) {
    super('')
  }

  async getChildren(): Promise<BaseTreeItem[]> {
    return []
  }

  protected getLabel() {
    return this._label
  }

  protected setLabel(value: string) {
    this._label = value
  }

  // @ts-expect-error
  get label() {
    return this.getLabel()
  }

  set label(v) {
    this.setLabel(v)
  }

  getIcon(name: string, themed = true) {
    if (themed) {
      return {
        light: this.ctx.asAbsolutePath(`res/light/${name}.svg`),
        dark: this.ctx.asAbsolutePath(`res/dark/${name}.svg`),
      }
    }
    else {
      return this.ctx.asAbsolutePath(`res/dark/${name}.svg`)
    }
  }

  getFlagIcon(locale: string) {
    if (!Config.showFlags)
      return undefined

    const flag = Config.tagSystem.getFlagName(locale)
    if (flag)
      return this.ctx.asAbsolutePath(`res/flags/${flag}.svg`)
  }
}
