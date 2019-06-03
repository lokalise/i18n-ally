import { window, workspace, Uri, ExtensionContext, commands } from 'vscode'
import { Global } from '../core'
import { ExtensionModule } from '../modules'
import { Commands } from '.'

class Guide {
  constructor (public ctx: ExtensionContext) {}

  async init () {
    const okText = 'Config Now'
    const result = await window.showInformationMessage(
      'Locate the `locales` directory in your project',
      okText
    )

    if (result !== okText)
      return

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

    return dirs.map(dirItem => dirItem.path)
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
      const guide = new Guide(ctx)
      guide.init()
    })
}

export default m
