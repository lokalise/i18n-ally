import * as fg from 'fast-glob'
import * as path from 'path'
import { ExtensionContext, workspace, window, commands } from 'vscode'
import { Global } from '../core'
import { ExtensionModule } from '../modules'
import { Commands } from '.'

class AutoDetectLocales {
  ctx: ExtensionContext

  constructor (ctx: ExtensionContext) {
    this.ctx = ctx
  }

  async init () {
    const localesPaths = Global.localesPaths
    if (localesPaths.length)
      return

    this.autoSet()
  }

  async autoSet () {
    const rootPath = workspace.rootPath
    if (!rootPath)
      return

    const pattern = [`${rootPath}/**/(locales|locale|i18n)`]
    let result: string[] = await fg(pattern, {
      ignore: ['**/node_modules'],
      onlyDirectories: true,
    })

    result = result.map(r => path.relative(rootPath, r))

    Global.updateLocalesPaths(result)

    await window.showInformationMessage(
      `Vue i18n Ally: Locales path auto set to "${result.join(';').toString()}"`,
    )
  }
}

const m: ExtensionModule = (ctx: ExtensionContext) => {
  const detector = new AutoDetectLocales(ctx)

  if (Global.enabled)
    detector.init()

  return commands.registerCommand(Commands.config_locales_auto,
    () => {
      detector.autoSet()
    })
}

export default m
