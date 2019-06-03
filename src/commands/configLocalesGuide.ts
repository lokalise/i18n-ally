import { window, workspace, Uri, ExtensionContext, commands } from 'vscode'
import { Common } from '../core'
import { ExtensionModule } from '../modules'

class Guide {
  ctx = null

  constructor (ctx: ExtensionContext) {
    this.ctx = ctx
  }

  async init () {
    const okText = 'Config Now'
    const result = await window.showInformationMessage(
      'Locate the `locales` directory in your project',
      okText
    )

    if (result !== okText)
      return

    const dirs = await this.pickDir()
    Common.updateLocalesPaths(dirs)

    this.success()
  }

  async pickDir (): Promise<string[]> {
    const dirs = await window.showOpenDialog({
      defaultUri: Uri.file(workspace.rootPath),
      canSelectFolders: true,
    })

    return dirs.map(dirItem => dirItem.path)
  }

  async success () {
    await window.showInformationMessage(
      'Locales path successfully configured.',
    )
  }
}

const m: ExtensionModule = (ctx) => {
  return commands.registerCommand('extension.vue-i18n-ally.config-locales',
    () => {
      const guide = new Guide(ctx)
      guide.init()
    })
}

export default m
