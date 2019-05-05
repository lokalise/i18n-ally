import * as vscode from 'vscode'
import * as fg from 'fast-glob'
import Common from './utils/Common'

class AutoInit {
  ctx: vscode.ExtensionContext

  constructor (ctx: vscode.ExtensionContext) {
    this.ctx = ctx

    this.init()
  }

  async init () {
    const i18nPaths = Common.i18nPaths
    if (i18nPaths.length)
      return

    this.autoSet()
  }

  async autoSet () {
    const rootPath = vscode.workspace.rootPath
    const pattern = [`${rootPath}/**/(locales|locale)`]
    const result: any[] = await fg(pattern, {
      ignore: ['**/node_modules'],
      onlyDirectories: true,
    })

    Common.updateI18nPaths(result)
  }
}

export default (ctx: vscode.ExtensionContext) => {
  const autoInit = new AutoInit(ctx)

  return vscode.commands.registerCommand('extension.vue-i18n-ally.auto-init', () => {
    autoInit.autoSet()
  })
}
