import { commands } from 'vscode'
import { ExtensionModule } from '../modules'
import { Commands } from './commands'
import { Analyst } from '~/core'

const m: ExtensionModule = (ctx) => {
  return [
    commands.registerCommand(Commands.refresh_usage,
      async(url: string) => {
        await Analyst.analyzeUsage(false)
      }),
  ]
}

export default m
