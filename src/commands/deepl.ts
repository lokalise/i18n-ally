import { commands, window } from 'vscode'
import { Commands } from './commands'
import { ExtensionModule } from '~/modules'
import { usage } from '~/translators/engines/deepl'
import i18n from '~/i18n'
import { Config } from '~/core'
import { abbreviateNumber } from '~/utils'

async function deepAuth() {
  const apiKey = Config.deeplApiKey

  if (!apiKey) {
    return window.showErrorMessage(
      i18n.t('prompt.deepl_api_key_required'),
    )
  }

  try {
    const deeplUsage = await usage()

    window.showInformationMessage(
      i18n.t(
        'prompt.deepl_usage',
        abbreviateNumber(deeplUsage.character_count),
        abbreviateNumber(deeplUsage.character_limit),
      ),
      i18n.t('prompt.button_discard'),
    )
  }
  catch (err) {
    window.showErrorMessage(i18n.t('prompt.deepl_error_get_usage'))
  }
}

export default <ExtensionModule> function() {
  return [
    commands.registerCommand(Commands.deepl_usage, deepAuth),
  ]
}
