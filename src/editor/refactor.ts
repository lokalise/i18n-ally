import { CodeActionProvider, CodeActionKind, TextDocument, Range, CodeAction, languages } from 'vscode'
import { LanguageSelectors, KeyDetector, Commands } from '../core'
import { ExtensionModule } from '../modules'
import i18n from '../i18n'

export class Refactor implements CodeActionProvider {
  public static readonly providedCodeActionKinds = [
    CodeActionKind.Refactor,
  ];

  public provideCodeActions (document: TextDocument, { start }: Range): CodeAction[] | undefined {
    const keyInfo = KeyDetector.getKeyAndRange(document, start)
    if (!keyInfo)
      return

    const { range, key } = keyInfo

    return [
      this.createRenameAction(document, key, range),
    ]
  }

  private createRenameAction (document: TextDocument, key: string, range: Range): CodeAction {
    const title = i18n.t('command.rename_key')
    const action = new CodeAction(title, CodeActionKind.Refactor)
    action.command = {
      title,
      command: Commands.rename_key,
      arguments: [
        key,
      ],
    }
    return action
  }
}

const m: ExtensionModule = () => {
  return [
    languages.registerCodeActionsProvider(LanguageSelectors, new Refactor(), {
      providedCodeActionKinds: Refactor.providedCodeActionKinds,
    }),
  ]
}

export default m
