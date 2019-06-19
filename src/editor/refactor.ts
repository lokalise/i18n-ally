import { CodeActionProvider, CodeActionKind, TextDocument, Range, CodeAction, languages } from 'vscode'
import { KeyDetector, Commands, Global } from '../core'
import { ExtensionModule } from '../modules'
import { LanguageSelectors } from '../meta'
import i18n from '../i18n'

export class Refactor implements CodeActionProvider {
  public static readonly providedCodeActionKinds = [
    CodeActionKind.Refactor,
    CodeActionKind.QuickFix,
  ];

  public provideCodeActions (document: TextDocument, { start }: Range): CodeAction[] | undefined {
    const keyInfo = KeyDetector.getKeyAndRange(document, start)
    if (!keyInfo)
      return

    const { key } = keyInfo

    const actions = [
      this.createRenameAction(key),
    ]

    const records = Global.loader.getTranslationsByKey(key)
    if (!records[Global.displayLanguage] || !records[Global.displayLanguage].value) {
      actions.push(this.createEditQuickFix(key))

      for (const record of Object.values(records)) {
        if (!record.shadow && record.value && record.locale !== Global.displayLanguage)
          actions.push(this.createTranslateQuickFix(key, record.locale))
      }
    }

    return actions
  }

  private createRenameAction (key: string): CodeAction {
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

  private createEditQuickFix (key: string) {
    const title = i18n.t('command.edit_key')
    const action = new CodeAction(title, CodeActionKind.QuickFix)
    action.command = {
      title,
      command: Commands.edit_key,
      arguments: [{
        keypath: key,
        locale: Global.displayLanguage,
      }],
    }
    return action
  }

  private createTranslateQuickFix (key: string, from?: string, to?: string) {
    from = from || Global.sourceLanguage
    to = to || Global.displayLanguage
    const title = i18n.t('command.translate_key_from', from)
    const action = new CodeAction(title, CodeActionKind.QuickFix)
    action.command = {
      title,
      command: Commands.translate_key,
      arguments: [{
        keypath: key,
        locale: to,
        from,
      }],
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
