import { commands } from 'vscode'
import { Commands, Analyst } from '../core'
import { ExtensionModule } from '../modules'

const m: ExtensionModule = (ctx) => {
  return [
    commands.registerCommand(Commands.refresh_usage,
      async(url: string) => {
        await Analyst.analyzeUsage(false)
      }),
  ]
}

export default m
