import { commands, window } from 'vscode'
import { Common } from '../core'
import { ExtensionModule } from '../modules'

const m: ExtensionModule = () => {
  return commands.registerCommand('extension.vue-i18n-ally.config-display-language',
    async () => {
      const locales = Common.loader.locales
      const result = await window.showQuickPick(locales, {
        placeHolder: Common.displayLanguage,
      })

      if (result)
        Common.displayLanguage = result
    })
}

export default m
