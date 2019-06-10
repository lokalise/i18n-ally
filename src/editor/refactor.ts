import { CodeActionProvider, CodeActionKind, TextDocument, Range, CodeAction, languages } from 'vscode'
import { LanguageSelectors, KeyDetector, Commands } from '../core'
import { ExtensionModule } from '../modules'

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
    const action = new CodeAction('Rename key', CodeActionKind.Refactor)
    action.command = {
      title: 'Rename',
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
