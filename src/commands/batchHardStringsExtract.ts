import { commands, window } from 'vscode'
import { notNullish } from '@antfu/utils'
import { DetectHardStrings } from './detectHardStrings'
import { ExtensionModule } from '~/modules'
import { Commands } from '~/commands'
import { extractHardStrings, generateKeyFromText } from '~/core/Extract'
import { Config, Global } from '~/core'
import { parseHardString } from '~/extraction/parseHardString'
import { DetectionResultToExtraction } from '~/editor/extract'

export async function BatchHardStringExtraction() {
  const document = window.activeTextEditor?.document
  if (!document)
    return
  const result = await DetectHardStrings()
  if (!result)
    return

  await extractHardStrings(document, result.map((i) => {
    const options = DetectionResultToExtraction(i, document)

    if (options.rawText && !options.text) {
      const result = parseHardString(options.rawText, options.document.languageId, options.isDynamic)
      options.text = result?.text || ''
      options.args = result?.args
    }

    const { rawText, text, range, args } = options
    const filepath = document.uri.fsPath
    const keypath = generateKeyFromText(rawText || text, filepath)
    const templates = Global.interpretRefactorTemplates(keypath, args, document, i).filter(Boolean)

    return {
      range,
      // TODO: handle templates
      replaceTo: templates[0],
      keypath,
      message: text,
      locale: Config.displayLanguage,
    }
  })
    .filter(notNullish))
}

const m: ExtensionModule = () => {
  return [
    commands.registerCommand(Commands.extract_hard_strings_batch, BatchHardStringExtraction),
  ]
}

export default m
