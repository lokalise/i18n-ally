import * as vscode from 'vscode'
import LocaleLoader from '../core/LocaleLoader'

export default (ctx: vscode.ExtensionContext) => {
  return vscode.commands.registerCommand('extension.vue-i18n-ally.debug',
    async () => {
      const loader = new LocaleLoader()
      await loader.init()
      console.log(JSON.stringify(loader.localeTree, null, 2))
    })
}
