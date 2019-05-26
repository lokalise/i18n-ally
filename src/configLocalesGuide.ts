import * as vscode from 'vscode'
import Common from './utils/Common'

class Guide {
  ctx = null

  constructor (ctx: vscode.ExtensionContext) {
    this.ctx = ctx
  }

  async init () {
    const okText = 'Config Now'
    const result = await vscode.window.showInformationMessage(
      'Locate the `locales` directory in your project',
      okText
    )

    if (result !== okText)
      return

    const dirs = await this.pickDir()
    Common.updateI18nPaths(dirs)

    this.success()
  }

  async pickDir (): Promise<string[]> {
    const dirs = await vscode.window.showOpenDialog({
      defaultUri: vscode.Uri.file(vscode.workspace.rootPath),
      canSelectFolders: true,
    })

    return dirs.map(dirItem => dirItem.path)
  }

  async success () {
    await vscode.window.showInformationMessage(
      'Locales path successfully configured.',
    )
  }
}

export default (ctx: vscode.ExtensionContext) => {
  return vscode.commands.registerCommand('extension.vue-i18n-ally.config-locales',
    () => {
      const guide = new Guide(ctx)
      guide.init()
    })
}
