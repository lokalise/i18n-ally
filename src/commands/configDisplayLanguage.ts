import * as vscode from 'vscode'
import Common from '../core/Common'
import i18nFiles from '../legacy/i18nFiles'

export default (ctx: vscode.ExtensionContext) => {
  return vscode.commands.registerCommand('extension.vue-i18n-ally.config-display-language',
    async () => {
      const locales = i18nFiles.getI18nFileByPath('').getLngs().map(l => l.lng)
      const result = await vscode.window.showQuickPick(locales, {
        placeHolder: Common.displayLanguage,
      })

      if (result)
        Common.displayLanguage = result
    })
}
