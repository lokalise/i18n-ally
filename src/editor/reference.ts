import { ExtensionContext, languages, ReferenceProvider, TextDocument, Position, ReferenceContext, CancellationToken, Location, Range, workspace } from 'vscode'
import { ExtensionModule } from '../modules'
import { LanguageSelectors, SupportedLanguageGlobs } from '../meta'
import { KeyDetector, Global } from '../core'

class Provider implements ReferenceProvider {
  async provideReferences (document: TextDocument, position: Position, context: ReferenceContext, token: CancellationToken): Promise<Location[] | undefined> {
    if (!Global.enabled)
      return []

    const target = KeyDetector.getKey(document, position)

    const files = await workspace.findFiles(SupportedLanguageGlobs, workspace.getConfiguration().get('files.exclude'))

    const locations: Location[] = []

    for (const uri of files) {
      const file = await workspace.openTextDocument(uri)
      const keys = KeyDetector.getKeys(file).filter(({ key }) => key === target)

      keys.forEach(({ start, end }) => {
        const range = new Range(
          document.positionAt(start),
          document.positionAt(end)
        )
        locations.push(new Location(uri, range))
      })
    }

    return locations
  }

  constructor (public readonly ctx: ExtensionContext) {}
}

const m: ExtensionModule = (ctx) => {
  const provider = new Provider(ctx)
  return [
    languages.registerReferenceProvider(LanguageSelectors, provider),
  ]
}

export default m
