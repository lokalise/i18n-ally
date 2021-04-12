import { CodeActionKind, CodeActionProvider, Command, languages, Range, Selection, TextDocument } from 'vscode'
import { ExtensionModule } from '~/modules'
import { Config, CurrentFile, Global } from '~/core'
import { Commands } from '~/commands'
import { ExtractTextOptions } from '~/commands/extractText'
import i18n from '~/i18n'
import { parseHardString } from '~/extraction/parseHardString'

class ExtractProvider implements CodeActionProvider {
  public async provideCodeActions(document: TextDocument, selection: Range | Selection): Promise<Command[]> {
    if (!Global.enabled)
      return []

    if (!Global.isLanguageIdSupported(document.languageId))
      return []

    if (!(selection instanceof Selection))
      return []

    const result = parseHardString(document.getText(selection), document.languageId)
    if (!result)
      return []

    const { text, args, trimmed } = result

    const options: ExtractTextOptions = {
      filepath: document.fileName,
      text,
      rawText: trimmed,
      args,
      range: selection,
      languageId: document.languageId,
    }

    const commands: Command[] = [{
      command: Commands.extract_text,
      title: i18n.t('refactor.extract_text'),
      arguments: [options],
    }]

    // Check for existing translations to recommend, convert them to their templates and then to commands, and add the commands to the command array
    CurrentFile.loader.keys
      .map(key => ({
        label: key,
        description: CurrentFile.loader.getValueByKey(key, Config.displayLanguage, 30),
      }))
      .filter(labelDescription => labelDescription.description === text)
      .flatMap(t => Global.refactorTemplates(t.label, args, document.languageId))
      .map(t => ({
        command: Commands.replace_with,
        title: i18n.t('refactor.replace_with', t),
        arguments: [t],
      }))
      .forEach(c => commands.push(c))

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
