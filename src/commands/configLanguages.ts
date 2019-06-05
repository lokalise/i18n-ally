import { commands, window } from 'vscode'
import { Global } from '../core'
import { ExtensionModule } from '../modules'
import { Commands } from '.'

async function pickLocale (locale?: any) {
  // from context menu
  if (locale && locale.node && locale.node.locale)
    return locale.node.locale as string
  if (locale && typeof locale === 'string')
    return locale

  const locales = Global.loader.locales
  return await window.showQuickPick(locales, {
    placeHolder: Global.displayLanguage,
  })
}

function handler (type: 'displayLanguage' | 'sourceLanguage') {
  return async (options?: any) => {
    const locale = await pickLocale(options)
    if (locale)
      Global[type] = locale
  }
}

const m: ExtensionModule = () => {
  return [
    commands.registerCommand(Commands.config_display_language, handler('displayLanguage')),
    commands.registerCommand(Commands.set_display_language, handler('displayLanguage')),
    commands.registerCommand(Commands.config_source_language, handler('sourceLanguage')),
    commands.registerCommand(Commands.set_source_language, handler('sourceLanguage')),
  ]
}

export default m
