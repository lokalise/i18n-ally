import * as vscode from 'vscode'
import Common from './utils/Common'

class Guide {
  constructor(force?: boolean) {
    if (force || !Common.i18nPaths.length) {
      this.init()
    }
  }

  async init() {
    const okText = '立即配置'
    const result = await vscode.window.showInformationMessage(
      '初始化vue-i18n: 项目里有 i18n 文件夹吗？',
      okText
    )

    if (result !== okText) {
      vscode.window.showInformationMessage(
        '你随时可以执行命令【vue-i18n:config】初始化配置',
        {
          modal: true,
        }
      )
      return
    }

    const dirs = await this.pickDir()
    Common.setConfig('i18nPaths', dirs.join(','))
    vscode.window.showInformationMessage('vue-i18n: 初始化好了')
  }

  async pickDir(): Promise<string[]> {
    let dirs = await vscode.window.showOpenDialog({
      defaultUri: vscode.Uri.file(vscode.workspace.rootPath),
      canSelectFolders: true,
    })

    if (dirs) {
      const okText = '继续配置'
      const result = await vscode.window.showInformationMessage(
        '项目里还有 i18n 文件夹吗？',
        '没有了',
        okText
      )

      if (result === okText) {
        const nextDirs: any = (await this.pickDir()).map(path => ({ path }))
        dirs.push(...nextDirs)
      }
    }

    return dirs ? [...new Set(dirs.map(dirItem => dirItem.path))] : []
  }
}

export default (ctx: vscode.ExtensionContext) => {
  const { window } = vscode
  const cmd = vscode.commands.registerCommand(
    'extension.vue-i18n.config',
    (uri: vscode.Uri) => {
      new Guide(true)
    }
  )

  new Guide()
}
