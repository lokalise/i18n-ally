import * as vscode from 'vscode'
import Common from './utils/Common'

class Guide {
  ctx = null

  constructor(ctx: vscode.ExtensionContext) {
    this.ctx = ctx

    this.init()
  }

  async init() {
    const okText = '立即配置'
    const result = await vscode.window.showInformationMessage(
      'vue-i18n: 项目里的locales文件夹在哪？',
      okText
    )

    if (result !== okText) {
      return
    }

    const dirs = await this.pickDir()
    Common.setConfig('i18nPaths', dirs.join(','))
    vscode.window.showInformationMessage('vue-i18n: 配置好了')
  }

  async pickDir(): Promise<string[]> {
    let dirs = await vscode.window.showOpenDialog({
      defaultUri: vscode.Uri.file(vscode.workspace.rootPath),
      canSelectFolders: true
    })
    const mergeDirs = Common.getConfig('i18nPaths')
      .split(',')
      .concat(dirs.map(dirItem => dirItem.path))
      .filter(dir => dir)

    return mergeDirs.filter((dir, index) => mergeDirs.indexOf(dir) === index)
  }
}

export default (ctx: vscode.ExtensionContext) => {
  return vscode.commands.registerCommand('extension.vue-i18n.config', () => {
    new Guide(ctx)
  })
}
