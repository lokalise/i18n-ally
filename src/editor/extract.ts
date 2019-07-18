import { Command, CodeActionProvider, window, CodeActionKind, languages } from 'vscode'
import { Global, Commands, ExtractTextOptions } from '../core'
import { LANG_SELECTORS } from '../meta'
import { ExtensionModule } from '../modules'
import i18n from '../i18n'

class ExtractProvider implements CodeActionProvider {
  public async provideCodeActions (): Promise<Command[]> {
    if (!Global.enabled)
      return []

    const editor = window.activeTextEditor
    if (!editor)
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
      title: i18n.t('refactor.extract_text'),
      arguments: [options],
    }]
  }
}

const m: ExtensionModule = () => {
  return [
    languages.registerCodeActionsProvider(
      LANG_SELECTORS,
      new ExtractProvider(),
      {
        providedCodeActionKinds: [CodeActionKind.Refactor],
      }
    ),
  ]
}

export default m
