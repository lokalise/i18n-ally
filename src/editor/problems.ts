import { ExtensionContext, languages, DiagnosticCollection, window, TextDocument, Diagnostic, DiagnosticSeverity, Range, workspace, Uri } from 'vscode'
import { EXT_NAMESPACE } from '../meta'
import { Global, KeyDetector, Config, Loader, CurrentFile } from '../core'
import { ExtensionModule } from '../modules'
import i18n from '../i18n'

export class ProblemProvider {
  private collection: DiagnosticCollection

  constructor(public readonly ctx: ExtensionContext) {
    this.collection = languages.createDiagnosticCollection(EXT_NAMESPACE)
  }

  update(document: TextDocument): void {
    if (!Global.enabled)
      return this.collection.clear()

    if (!Global.isLanguageIdSupported(document.languageId))
      return

    const locale = Config.displayLanguage
    const loader: Loader = CurrentFile.loader

    if (document) {
      const problems: Diagnostic[] = []
      this.collection.delete(document.uri)

      const keys = KeyDetector.getKeys(document)
      // get all keys of current file
      keys.forEach(({ key, start, end }) => {
        const has_translation = !!loader.getValueByKey(key, locale)
        if (has_translation)
          return

        const exists = !!loader.getNodeByKey(key)

        if (exists) {
          problems.push({
            message: i18n.t('misc.missing_translation', locale, key),
            range: new Range(document.positionAt(start), document.positionAt(end)),
            severity: DiagnosticSeverity.Information,
          })
        }
        else {
          problems.push({
            message: i18n.t('misc.missing_key', locale, key),
            range: new Range(document.positionAt(start), document.positionAt(end)),
            severity: DiagnosticSeverity.Information,
          })
        }
      })

      this.collection.set(document.uri, problems)
    }
    else {
      this.collection.clear()
    }
  }

  clear() {
    this.collection.clear()
  }

  clearUri(uri: Uri) {
    this.collection.delete(uri)
  }
}

const m: ExtensionModule = (ctx: ExtensionContext) => {
  const provider = new ProblemProvider(ctx)

  if (window.activeTextEditor)
    provider.update(window.activeTextEditor.document)

  return [
    CurrentFile.loader.onDidChange(() => {
      if (window.activeTextEditor)
        provider.update(window.activeTextEditor.document)
    }),
    workspace.onDidChangeTextDocument(doc => provider.update(doc.document)),
    workspace.onDidCloseTextDocument(e => provider.clearUri(e.uri)),
  ]
}

export default m
