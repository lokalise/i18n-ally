import { commands } from 'vscode'
import { DetectHardStrings } from './detectHardStrings'
import { ExtensionModule } from '~/modules'
import { Commands } from '~/commands'

export async function ExtractAllInFileCommand() {
  await DetectHardStrings()
}

const m: ExtensionModule = () => {
  return [
    commands.registerCommand(Commands.extraction_detect_current_file, ExtractAllInFileCommand),
  ]
}

export default m
