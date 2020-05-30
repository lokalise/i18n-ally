import { commands } from 'vscode'
import { Commands } from '../core/Commands'
import { ExtensionModule } from '../modules'
import { Server } from './server'
import { ServerLog } from './log'

const m: ExtensionModule = () => {
  return [
    commands.registerCommand(Commands.server_start, () => {
      Server.instance.start()
      ServerLog.show()
    }),
    commands.registerCommand(Commands.server_stop, () => {
      Server.instance.stop()
    }),
  ]
}

export default m
