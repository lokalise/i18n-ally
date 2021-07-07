import { commands, window } from 'vscode'
import { Commands } from './commands'
import { ExtensionModule } from '~/modules'
import { ProgressBaseItem } from '~/views'
import i18n from '~/i18n'
import { Global, Config } from '~/core'

async function pickLocale(locale: any, type: 'displayLanguage' | 'sourceLanguage') {
  // from context menu
  if (locale && locale.node && locale.node.locale)
    return locale.node.locale as string
  if (locale && typeof locale === 'string')
    return locale

  const locales = Global.visibleLocales
  const placeHolder = type === 'displayLanguage'
    ? i18n.t('prompt.select_display_locale', Config.displayLanguage)
    : i18n.t('prompt.select_source_locale', Config.sourceLanguage)

  const result = await window.showQuickPick(locales, {
    placeHolder,
  })
  if (result !== placeHolder)
    return result
}

function handler(type: 'displayLanguage' | 'sourceLanguage') {
  return async(options?: any) => {
    const locale = await pickLocale(options, type)
    if (locale)
      Config[type] = locale
  }
}

function visibilityHandler(value?: boolean) {
  return (item: ProgressBaseItem) => {
    Config.toggleLocaleVisibility(item.node.locale, value)
  }
}

export default <ExtensionModule> function() {
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
