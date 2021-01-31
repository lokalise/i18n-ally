import { commands, window } from 'vscode'
import { HardStringInfo } from '~/frameworks'
import { ExtensionModule } from '~/modules'
import { Global } from '~/core'
import { Commands } from '~/commands'

export async function DetectHardStrings() {
  const doc = window.activeTextEditor?.document

  if (!doc)
    return
  const frameworks = Global.enabledFrameworks.filter(i => i.supportAutoExtraction)

  let strings: HardStringInfo[] = []
  for (const framework of frameworks) {
    const result = framework.getHardStrings?.(doc)
    if (result)
      strings = result
  }

  window.showInformationMessage(JSON.stringify(strings, null, 2))

  return strings
}

const m: ExtensionModule = () => {
  return [
    commands.registerCommand(Commands.detect_hard_strings, DetectHardStrings),
  ]
}

export default m
