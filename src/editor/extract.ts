import { Command, CodeActionProvider, window, CodeActionKind, languages } from 'vscode'
import { Global, Commands, ExtractTextOptions } from '../core'
import { ExtensionModule } from '../modules'
import language_selectors from './language_selectors'

class ExtractProvider implements CodeActionProvider {
  public async provideCodeActions (): Promise<Command[]> {
    const editor = window.activeTextEditor
    if (!editor || !Global.hasLocalesConfigured)
      return []

    const { selection } = editor
    const text = editor.document.getText(selection)
    if (!text || selection.start.line !== selection.end.line)
      return []

    const options: ExtractTextOptions = {
      filepath: editor.document.fileName,
      text,
      range: selection,
    }

    return [{
      command: Commands.extract_text,
      title: 'Extract text to vue-i18n locales',
      arguments: [options],
    }]
  }
}

const m: ExtensionModule = () => {
  return [
    languages.registerCodeActionsProvider(
      language_selectors,
      new ExtractProvider(),
      {
        providedCodeActionKinds: [CodeActionKind.Refactor],
      }
    ),
  ]
}

export default m
