import { commands, Range, window } from 'vscode'
import { DetectHardStrings } from './detectHardStrings'
import { ExtensionModule } from '~/modules'
import { Commands } from '~/commands'
import { extractHardStrings, generateKeyFromText } from '~/core/Extract'
import { Config, Global } from '~/core'
import { parseHardString } from '~/extraction/parseHardString'

export async function BatchHardStringExtraction() {
  const document = window.activeTextEditor?.document
  if (!document)
    return
  const result = await DetectHardStrings()
  if (!result)
    return

  await extractHardStrings(document, result.map((i) => {
    const keypath = generateKeyFromText(i.text, document.uri.fsPath)
    const result = parseHardString(i.fullText ?? i.text, document.languageId, i.isDynamic)
    const templates = Global.refactorTemplates(keypath, result?.args, document.languageId).filter(Boolean)

    return {
      range: new Range(
        document.positionAt(i.fullStart ?? i.start),
        document.positionAt(i.fullEnd ?? i.end),
      ),
      replaceTo: templates[0],
      keypath,
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
