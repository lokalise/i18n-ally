import { commands } from 'vscode'
import { Commands } from './commands'
import { ExtensionModule } from '~/modules'
import { Analyst } from '~/core'

export default <ExtensionModule> function() {
  return [
    commands.registerCommand(Commands.refresh_usage,
      async() => {
        await Analyst.analyzeUsage(false)
      },
    ),
  ]
}
