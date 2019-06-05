import { commands, window } from 'vscode'
import { Global } from '../core'
import { ExtensionModule } from '../modules'
import { Commands } from '.'
import { ProgressItem } from '../views/ProgressView'

async function pickLocale (locale?: any) {
  // from context menu
  if (locale && locale.node && locale.node.locale)
    return locale.node.locale as string
  if (locale && typeof locale === 'string')
    return locale

  const locales = Global.visibleLocales
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

function visibilityHandler (value?: boolean) {
  return (item: ProgressItem) => {
    Global.toggleLocaleVisibility(item.node.locale, value)
  }
}

const m: ExtensionModule = () => {
  return [
    commands.registerCommand(Commands.config_display_language, handler('displayLanguage')),
    commands.registerCommand(Commands.set_display_language, handler('displayLanguage')),
    commands.registerCommand(Commands.config_source_language, handler('sourceLanguage')),
    commands.registerCommand(Commands.set_source_language, handler('sourceLanguage')),
    commands.registerCommand(Commands.locale_visibility_toggle, visibilityHandler()),
    commands.registerCommand(Commands.locale_visibility_show, visibilityHandler(true)),
    commands.registerCommand(Commands.locale_visibility_hide, visibilityHandler(false)),
  ]
}

export default m
