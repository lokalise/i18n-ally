import { commands, TextDocument, window, workspace } from 'vscode'
import { notNullish } from '@antfu/utils'
import { DetectHardStrings } from './detectHardStrings'
import { ExtensionModule } from '~/modules'
import { Commands } from '~/commands'
import { extractHardStrings, generateKeyFromText } from '~/core/Extract'
import { Config, Global } from '~/core'
import { parseHardString } from '~/extraction/parseHardString'
import { DetectionResultToExtraction } from '~/editor/extract'
import { Log } from '~/utils'

export async function BatchHardStringExtraction(...args: any[]) {
  // console.log('BatchHardStringExtraction', args)

  const documents: (TextDocument | undefined)[] = []

  // call from file explorer context
  if (args.length >= 2 && Array.isArray(args[1])) {
    documents.push(
      ...await Promise.all(
        args[1].map(i => workspace.openTextDocument(i)),
      ),
    )
  }
  // call from command pattale
  else {
    documents.push(window.activeTextEditor?.document)
  }

  for (const document of documents) {
    if (!document)
      continue

    try {
      const result = await DetectHardStrings(document)
      if (!result)
        continue

      await extractHardStrings(
        document,
        result.map((i) => {
          const options = DetectionResultToExtraction(i, document)

          if (options.rawText && !options.text) {
            const result = parseHardString(options.rawText, options.document.languageId, options.isDynamic)
            options.text = result?.text || ''
            options.args = result?.args
          }

          const { rawText, text, range, args } = options
          const filepath = document.uri.fsPath
          const keypath = generateKeyFromText(rawText || text, filepath, true)
          const templates = Global.interpretRefactorTemplates(keypath, args, document, i).filter(Boolean)

          if (!templates.length) {
            Log.warn(`No refactor template found for "${keypath}" in "${filepath}"`)
            return undefined
          }

          return {
            range,
            replaceTo: templates[0],
            keypath,
            message: text,
            locale: Config.displayLanguage,
          }
        })
          .filter(notNullish),
      )
    }
    catch (e) {
      Log.error(`Failed to extract ${document.fileName}`)
      Log.error(e, false)
    }
  }
}

const m: ExtensionModule = () => {
  return [
    commands.registerCommand(Commands.extract_hard_strings_batch, BatchHardStringExtraction),
  ]
}

export default m
