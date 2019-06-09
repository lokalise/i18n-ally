import * as fg from 'fast-glob'
import * as path from 'path'
import { ExtensionContext, workspace, window, commands } from 'vscode'
import { Global } from '../core'
import { ExtensionModule } from '../modules'
import { Commands } from '.'
import { ConfigLocalesGuide } from './configLocalesGuide'

export class AutoDetectLocales {
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

    if (result.length) {
      Global.updateLocalesPaths(result)

      await window.showInformationMessage(
        `Locales path auto set to "${result.join(';').toString()}"`,
      )
    }
    else {
      const guide = new ConfigLocalesGuide(this.ctx)
      guide.prompt()
    }
  }
}

const m: ExtensionModule = (ctx: ExtensionContext) => {
  return commands.registerCommand(Commands.config_locales_auto,
    () => {
      const detector = new AutoDetectLocales(ctx)
      detector.autoSet()
    })
}

export default m
