import { commands, env, Uri, window } from 'vscode'
import { Commands } from '../core'
import { ExtensionModule } from '../modules'
import Links from '../links'
import i18n from '../i18n'

const m: ExtensionModule = (ctx) => {
  return [
    commands.registerCommand(Commands.open_url,
      async(url: string) => {
        // @ts-ignore
        await env.openExternal(Uri.parse(url))
      }),

    commands.registerCommand(Commands.support,
      async() => {
        const options = [{
          text: i18n.t('prompt.star_on_github'),
          url: Links.github,
        }, {
          text: i18n.t('prompt.donate'),
          url: Links.open_collective,
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

export default m
