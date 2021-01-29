import { commands } from 'vscode'
import { ExtensionModule } from '~/modules'
import { Commands } from '~/commands'

async function ExtractAllInFileCommand() {

}

const m: ExtensionModule = () => {
  return [
    commands.registerCommand(Commands.extract_current_file, ExtractAllInFileCommand),
  ]
}

export default m
