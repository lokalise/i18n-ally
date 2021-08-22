import { commands, env, Uri, window } from 'vscode'
import { ExtensionModule } from '~/modules'
import Links from '~/links'
import { Commands } from '~/commands'
import i18n from '~/i18n'

export default <ExtensionModule> function() {
  return [
    commands.registerCommand(Commands.open_url,
      async(url: string) => {
        await env.openExternal(Uri.parse(url))
      }),

    commands.registerCommand(Commands.open_docs_hard_string,
      async() => {
        await env.openExternal(Uri.parse('https://github.com/lokalise/i18n-ally/wiki/Hard-coded-Strings-Extraction'))
      }),

    commands.registerCommand(Commands.support,
      async() => {
        const options = [{
          text: i18n.t('prompt.star_on_github'),
          url: Links.github,
        }]
        const result = await window.showInformationMessage(
          i18n.t('prompt.support'),
          ...options.map(i => i.text),
        )
        const selected = options.find(i => i.text === result)
        if (selected)
          // @ts-ignore
          await env.openExternal(Uri.parse(selected.url))
      }),
  ]
}
