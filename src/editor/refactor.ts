import { CodeActionProvider, CodeActionKind, TextDocument, Range, CodeAction, languages } from 'vscode'
import { KeyDetector, Commands, Config, Loader, CurrentFile } from '../core'
import { ExtensionModule } from '../modules'
import i18n from '../i18n'
import { Global } from '../core/Global'

export class Refactor implements CodeActionProvider {
  public static readonly providedCodeActionKinds = [
    CodeActionKind.Refactor,
    CodeActionKind.QuickFix,
  ]

  public provideCodeActions(document: TextDocument, { start }: Range): CodeAction[] | undefined {
    const keyInfo = KeyDetector.getKeyAndRange(document, start)
    if (!keyInfo)
      return

    const { key } = keyInfo

    const actions = []

    const loader: Loader = CurrentFile.loader

    const records = loader.getTranslationsByKey(key)
    if (!records[Config.displayLanguage] || !records[Config.displayLanguage].value) {
      actions.push(this.createEditQuickFix(key))

      for (const record of Object.values(records)) {
        if (!record.shadow && record.value && record.locale !== Config.displayLanguage)
          actions.push(this.createTranslateQuickFix(key, record.locale))
      }
    }

    return actions
  }

  private createEditQuickFix(key: string) {
    const title = i18n.t('command.edit_key')
    const action = new CodeAction(title, CodeActionKind.QuickFix)
    action.command = {
      title,
      command: Commands.edit_key,
      arguments: [{
        keypath: key,
        locale: Config.displayLanguage,
      }],
    }
    return action
  }

  private createTranslateQuickFix(key: string, from?: string, to?: string) {
    from = from || Config.sourceLanguage
    to = to || Config.displayLanguage
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
    languages.registerCodeActionsProvider(
      Global.getDocumentSelectors(),
      new Refactor(),
      {
        providedCodeActionKinds: Refactor.providedCodeActionKinds,
      }),
  ]
}

export default m
