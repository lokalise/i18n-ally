import path from 'path'
import { Uri, workspace, window, commands } from 'vscode'
import fg from 'fast-glob'
import { ExtensionModule } from '../modules'
import { Commands } from './commands'
import { Config } from '~/core'
import i18n from '~/i18n'

export class ConfigLocalesGuide {
  static async prompt() {
    const okText = i18n.t('prompt.config_locales_button')
    const result = await window.showInformationMessage(
      i18n.t('prompt.config_locales_info'),
      okText,
    )

    if (result !== okText)
      return

    this.config()
  }

  static async config() {
    const dirs = await this.pickDir()
    Config.updateLocalesPaths(dirs)

    this.success()
  }

  static async pickDir(): Promise<string[]> {
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
      .map((item) => {
        if (process.platform === 'win32') // path on windows will starts with '/'
          return item.path.slice(1)
        return item.path
      })
      .map(pa => path
        .relative(rootPath, pa)
        .replace(/\\/g, '/'),
      )
  }

  static async success() {
    await window.showInformationMessage(i18n.t('prompt.config_locales_success'))
  }

  static async autoSet() {
    const rootPath = workspace.rootPath
    if (!rootPath)
      return

    const pattern = ['**/**/(locales|locale|i18n|lang|langs|language|languages|messages)']
    const result: string[] = await fg(pattern, {
      cwd: rootPath,
      ignore: [
        '**/node_modules',
        '**/dist',
        '**/test',
        '**/tests',
        '**/tmp',
        '**/build',
        '**/.build',
        '**/logs',
        '**/vendor', // PHP
        '**/vendors', // PHP
        '**/target', // Rust
      ],
      onlyDirectories: true,
    })

    if (result.length) {
      Config.updateLocalesPaths(result)

      await window.showInformationMessage(
        i18n.t('prompt.config_locales_auto_success', result.join(';').toString()),
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
