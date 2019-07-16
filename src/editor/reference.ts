import { ExtensionContext, languages, ReferenceProvider, TextDocument, Position, ReferenceContext, CancellationToken, Location, Range, RenameProvider, WorkspaceEdit, ProviderResult } from 'vscode'
import { ExtensionModule } from '../modules'
import { LanguageSelectors } from '../meta'
import { KeyDetector, Global } from '../core'

class Provider implements ReferenceProvider, RenameProvider {
  async provideReferences (document: TextDocument, position: Position, context: ReferenceContext, token: CancellationToken): Promise<Location[] | undefined> {
    if (!Global.enabled)
      return []

    const key = KeyDetector.getKey(document, position)

    if (!key)
      return []

    return await Global.loader.analyst.getAllOccurrenceLocations(key)
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

    const key = KeyDetector.getKey(document, position)

    if (!key)
      return

    const edit = new WorkspaceEdit()

    const locations = await Global.loader.analyst.getAllOccurrenceLocations(key)

    for (const location of locations)
      edit.replace(location.uri, location.range, newName)

    Global.loader.renameKey(key, newName)

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
