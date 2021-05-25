import { commands, Range, window } from 'vscode'
import { DetectHardStrings } from './detectHardStrings'
import { ExtensionModule } from '~/modules'
import { Commands } from '~/commands'
import { extractHardStrings } from '~/core/Extract'
import { Config } from '~/core'

export async function BatchHardStringExtraction() {
  const document = window.activeTextEditor?.document
  if (!document)
    return
  const result = await DetectHardStrings()
  if (!result)
    return

  await extractHardStrings(document, result.map((i) => {
    return {
      range: new Range(document.positionAt(i.start), document.positionAt(i.end)),
      replaceTo: '$t(\'hello\')',
      keypath: 'hello',
      message: i.text,
      locale: Config.displayLanguage,
    }
  }))
}

const m: ExtensionModule = () => {
  return [
    commands.registerCommand(Commands.extract_hard_strings_batch, BatchHardStringExtraction),
  ]
}

export default m
