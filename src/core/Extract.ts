import { basename, extname } from 'path'
import { Range, TextDocument, window } from 'vscode'
import { nanoid } from 'nanoid'
import limax from 'limax'
import { Config } from '../extension'
import { CurrentFile } from '.'

export interface ExtractInfo {
  range: Range
  replaceTo: string
  keypath?: string
  message?: string
  locale?: string
}

export function generateKeyFromText(text: string, filepath?: string) {
  let key: string

  const keygenStrategy = Config.keygenStrategy

  if (keygenStrategy === 'random') {
    key = nanoid()
  }
  else if (keygenStrategy === 'empty') {
    key = ''
  }
  else {
    key = limax(text, { separator: Config.preferredDelimiter, tone: false })
      .slice(0, Config.extractKeyMaxLength ?? Infinity)
  }

  const keyPrefix = Config.keyPrefix

  if (keyPrefix && keygenStrategy !== 'empty')
    key = keyPrefix + key

  if (filepath && key.includes('fileName')) {
    key = key
      .replace('{fileName}', basename(filepath))
      .replace('{fileNameWithoutExt}', basename(filepath, extname(filepath)))
  }

  return key
}

export async function extractHardStrings(document: TextDocument, extracts: ExtractInfo[]) {
  const editor = await window.showTextDocument(document)
  const filepath = document.uri.fsPath
  const sourceLanguage = Config.sourceLanguage

  extracts.sort((a, b) => b.range.start.compareTo(a.range.start))

  await Promise.all(
    [
      // replace
      editor.edit((editBuilder) => {
        for (const extract of extracts) {
          editBuilder.replace(
            extract.range,
            extract.replaceTo,
          )
        }
      }),
      // save keys
      CurrentFile.loader.write(
        extracts
          .filter(i => i.keypath != null && i.message != null)
          .map(e => ({
            textFromPath: filepath,
            filepath: undefined,
            keypath: e.keypath!,
            value: e.message!,
            locale: e.locale || sourceLanguage,
          })),
      ),
    ],
  )
}
