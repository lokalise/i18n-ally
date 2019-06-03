import { commands, window } from 'vscode'
import { Common } from '../core'
import { ExtensionModule } from '../modules'
import { Command } from '.'

const m: ExtensionModule = () => {
  return commands.registerCommand(Command.config_display_language,
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
