import * as vscode from 'vscode'
import * as fg from 'fast-glob'
import * as path from 'path'
import Common from '../utils/Common'

class AutoDetectLocales {
  ctx: vscode.ExtensionContext

  constructor (ctx: vscode.ExtensionContext) {
    this.ctx = ctx
  }

  async init () {
    const localesPaths = Common.localesPaths
    if (localesPaths.length)
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

    Common.updateLocalesPaths(result)

    await vscode.window.showInformationMessage(
      `VueI18n Ally: Locales path auto set to "${result.join(';').toString()}"`,
    )
  }
}

export default (ctx: vscode.ExtensionContext) => {
  const detector = new AutoDetectLocales(ctx)
  detector.init()

  return vscode.commands.registerCommand('extension.vue-i18n-ally.auto-detect-locales', () => {
    detector.autoSet()
  })
}
