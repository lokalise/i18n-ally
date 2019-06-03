import { commands } from 'vscode'
import { LocaleLoader } from '../core'
import { ExtensionModule } from '../modules'
import { Commands } from '.'

const m: ExtensionModule = () => {
  return commands.registerCommand(Commands.debug,
    async () => {
      const loader = new LocaleLoader()
      await loader.init()
      console.log(JSON.stringify(loader.files, null, 2))
      console.log(JSON.stringify(loader.localeTree, null, 2))
    })
}

export default m
