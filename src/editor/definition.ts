import { languages, TextDocument, Position, Definition, DefinitionLink, Uri, workspace, Location, Range } from 'vscode'
import { ExtensionModule } from '~/modules'
import { Global, KeyDetector, CurrentFile } from '~/core'

class DefinitionProvider {
  async provideDefinition(document: TextDocument, position: Position): Promise<Definition | DefinitionLink[]> {
    const key = KeyDetector.getKey(document, position)
    if (!key)
      return []

    const filepath = CurrentFile.loader.getFilepathByKey(key)
    if (!filepath)
      return []

    const localeDocument = await workspace.openTextDocument(filepath)
    if (!localeDocument)
      return []

    const parser = Global.getMatchedParser(filepath)
    if (!parser)
      return []

    const range = parser.navigateToKey(localeDocument.getText(), key, await Global.requestKeyStyle())

    const { start = 0, end = 0 } = range || {}

    return new Location(
      Uri.file(filepath),
      new Range(
        localeDocument.positionAt(start),
        localeDocument.positionAt(end),
      ),
    )
  }
}

const definition: ExtensionModule = () => {
  return [
    languages.registerDefinitionProvider(
      Global.getDocumentSelectors(),
      new DefinitionProvider(),
    ),
  ]
}

export default definition
