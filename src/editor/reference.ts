import { ExtensionContext, languages, ReferenceProvider, TextDocument, Position, ReferenceContext, CancellationToken, Location, Range, workspace, RenameProvider, WorkspaceEdit, ProviderResult } from 'vscode'
import { ExtensionModule } from '../modules'
import { LanguageSelectors, SupportedLanguageGlobs } from '../meta'
import { KeyDetector, Global } from '../core'

class Provider implements ReferenceProvider, RenameProvider {
  async getDocuments () {
    const uris = await workspace.findFiles(SupportedLanguageGlobs, workspace.getConfiguration().get('files.exclude'))

    const documents: TextDocument[] = []
    for (const uri of uris)
      documents.push(await workspace.openTextDocument(uri))

    return documents
  }

  async provideReferences (document: TextDocument, position: Position, context: ReferenceContext, token: CancellationToken): Promise<Location[] | undefined> {
    if (!Global.enabled)
      return []

    const target = KeyDetector.getKey(document, position)
    const files = await this.getDocuments()
    const locations: Location[] = []

    for (const file of files) {
      const keys = KeyDetector.getKeys(file).filter(({ key }) => key === target)

      keys.forEach(({ start, end }) => {
        const range = new Range(
          document.positionAt(start),
          document.positionAt(end)
        )
        locations.push(new Location(file.uri, range))
      })
    }

    return locations
  }

  prepareRename (document: TextDocument, position: Position, token: CancellationToken): ProviderResult<Range | { range: Range; placeholder: string }> {
    const result = KeyDetector.getKeyAndRange(document, position)
    if (!result)
      return
    const { key, range } = result
    return { range, placeholder: key }
  }

  async provideRenameEdits (document: TextDocument, position: Position, newName: string, token: CancellationToken): Promise<WorkspaceEdit | undefined> {
    if (!Global.enabled)
      return

    const target = KeyDetector.getKey(document, position)

    if (!target)
      return

    const files = await this.getDocuments()

    const edit = new WorkspaceEdit()

    for (const file of files) {
      const keys = KeyDetector.getKeys(file).filter(({ key }) => key === target)
      keys.forEach(({ start, end }) => {
        edit.replace(file.uri, new Range(
          document.positionAt(start),
          document.positionAt(end),
        ), newName)
      })
    }

    Global.loader.renameKey(target, newName)

    return edit
  }

  constructor (public readonly ctx: ExtensionContext) {}
}

const m: ExtensionModule = (ctx) => {
  const provider = new Provider(ctx)
  return [
    languages.registerReferenceProvider(LanguageSelectors, provider),
    languages.registerRenameProvider(LanguageSelectors, provider),
  ]
}

export default m
