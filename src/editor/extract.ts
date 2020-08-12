import { CodeActionKind, CodeActionProvider, Command, languages, Range, Selection, TextDocument } from 'vscode'
import { Commands, Global } from '../core'
import { ExtensionModule } from '../modules'
import i18n from '../i18n'

export interface ExtractTextOptions {
  filepath: string
  text: string
  range: Range
  languageId?: string
}

class ExtractProvider implements CodeActionProvider {
  public async provideCodeActions(document: TextDocument, selection: Range | Selection): Promise<Command[]> {
    if (!Global.enabled)
      return []

    if (!Global.isLanguageIdSupported(document.languageId))
      return []

    if (!(selection instanceof Selection))
      return []

    const text = document.getText(selection)
    if (!text || selection.start.line !== selection.end.line)
      return []

    const options: ExtractTextOptions = {
      filepath: document.fileName,
      text,
      range: selection,
      languageId: document.languageId,
    }

    const commands: Command[] = [{
      command: Commands.extract_text,
      title: i18n.t('refactor.extract_text'),
      arguments: [options],
    }]

    return commands
  }
}

const m: ExtensionModule = () => {
  return [
    languages.registerCodeActionsProvider(
      '*',
      new ExtractProvider(),
      {
        providedCodeActionKinds: [CodeActionKind.Refactor],
      },
    ),
  ]
}

export default m
