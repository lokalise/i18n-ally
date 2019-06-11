import * as fg from 'fast-glob'
import * as path from 'path'
import { Uri, workspace, window, commands } from 'vscode'
import { Global } from '../core'
import { ExtensionModule } from '../modules'
import { Commands } from '.'
import i18n from '../i18n'

export class ConfigLocalesGuide {
  static async prompt () {
    const okText = i18n.t('prompt.config_locales_button')
    const result = await window.showInformationMessage(
      i18n.t('prompt.config_locales_info'),
      okText
    )

    if (result !== okText)
      return

    this.config()
  }

  static async config () {
    const dirs = await this.pickDir()
    Global.updateLocalesPaths(dirs)

    this.success()
  }

  static async pickDir (): Promise<string[]> {
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

  static async success () {
    await window.showInformationMessage(i18n.t('prompt.config_locales_success'))
  }

  static async autoSet () {
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
        i18n.t('prompt.config_locales_auto_success', result.join(';').toString())
      )
    }
    else {
      window.showWarningMessage(i18n.t('prompt.locales_dir_not_found'))
      this.prompt()
    }
  }
}

const m: ExtensionModule = () => {
  return [
    commands.registerCommand(Commands.config_locales_auto,
      () => ConfigLocalesGuide.autoSet()),
    commands.registerCommand(Commands.config_locales,
      () => ConfigLocalesGuide.config()),
  ]
}

export default m
