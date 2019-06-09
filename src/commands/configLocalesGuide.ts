import { window, workspace, Uri, ExtensionContext, commands } from 'vscode'
import { Global } from '../core'
import { ExtensionModule } from '../modules'
import { Commands } from '.'
import * as path from 'path'

export class ConfigLocalesGuide {
  constructor (public ctx: ExtensionContext) {}

  async prompt () {
    const okText = 'Config Now'
    const result = await window.showInformationMessage(
      'Config the locales directory for your project',
      okText
    )

    if (result !== okText)
      return

    this.config()
  }

  async config () {
    const dirs = await this.pickDir()
    Global.updateLocalesPaths(dirs)

    this.success()
  }

  async pickDir (): Promise<string[]> {
    const rootPath = workspace.rootPath
    if (!rootPath)
      return []

    const dirs = await window.showOpenDialog({
      defaultUri: Uri.file(rootPath),
      canSelectFolders: true,
    })

    if (!dirs)
      return []

    return dirs
      .map(item => {
        if (process.platform === 'win32') // path on windows will starts with '/'
          return item.path.slice(1)
        return item.path
      })
      .map(pa => path.relative(rootPath, pa))
  }

  async success () {
    await window.showInformationMessage(
      'Locales path successfully configured.',
    )
  }
}

const m: ExtensionModule = (ctx) => {
  return commands.registerCommand(Commands.config_locales,
    () => {
      const guide = new ConfigLocalesGuide(ctx)
      guide.config()
    })
}

export default m
