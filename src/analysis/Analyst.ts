import { workspace, TextDocument, Range, Location } from 'vscode'
import { SupportedLanguageGlobs } from '../meta'
import { KeyDetector } from '../core'

export interface Occurrence {
  keypath: string
  location: Location
  languageId: string
}

export class Analyst {
  static async getDocuments () {
    const uris = await workspace.findFiles(SupportedLanguageGlobs, workspace.getConfiguration().get('files.exclude'))

    const documents: TextDocument[] = []
    for (const uri of uris)
      documents.push(await workspace.openTextDocument(uri))

    return documents
  }

  static async getAllOccurrences (targetKey?: string) {
    const data: Occurrence[] = []
    const files = await this.getDocuments()

    for (const file of files) {
      let keys = KeyDetector.getKeys(file)
      if (targetKey)
        keys = keys.filter(({ key }) => key === targetKey)

      keys.forEach(({ start, end, key }) => {
        const range = new Range(
          file.positionAt(start),
          file.positionAt(end)
        )
        data.push({
          keypath: key,
          location: new Location(file.uri, range),
          languageId: file.languageId,
        })
      })
    }

    return data
  }
}
