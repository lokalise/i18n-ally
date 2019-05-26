import * as vscode from 'vscode'
import * as fg from 'fast-glob'
import * as path from 'path'
import Common from './utils/Common'

class AutoInit {
  ctx: vscode.ExtensionContext

  constructor (ctx: vscode.ExtensionContext) {
    this.ctx = ctx
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
    let result: string[] = await fg(pattern, {
      ignore: ['**/node_modules'],
      onlyDirectories: true,
    })

    result = result.map(r => path.relative(rootPath, r))

    Common.updateI18nPaths(result)

    await vscode.window.showInformationMessage(
      `VueI18n locales path auto set to ${result.join(';').toString()}`,
    )
  }
}

export default (ctx: vscode.ExtensionContext) => {
  const autoInit = new AutoInit(ctx)
  autoInit.init()

  return vscode.commands.registerCommand('extension.vue-i18n-ally.auto-detect-locales', () => {
    autoInit.autoSet()
  })
}
