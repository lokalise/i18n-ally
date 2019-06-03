import { commands, window } from 'vscode'
import { Global } from '../core'
import { ExtensionModule } from '../modules'
import { Commands } from '.'

const m: ExtensionModule = () => {
  return commands.registerCommand(Commands.config_display_language,
    async () => {
      const locales = Global.loader.locales
      const result = await window.showQuickPick(locales, {
        placeHolder: Global.displayLanguage,
      })

      if (result)
        Global.displayLanguage = result
    })
}

export default m
