import { ExtensionContext, languages, DiagnosticCollection, window, TextDocument, Diagnostic, DiagnosticSeverity, Range } from 'vscode'
import { Global, KeyDetector, isSupportedLanguageId } from '../core'
import { ExtensionModule } from '../modules'

export class ProblemProvider {
  private collection: DiagnosticCollection

  constructor (public readonly ctx: ExtensionContext) {
    this.collection = languages.createDiagnosticCollection('vue-i18n-ally')
  }

  update (document: TextDocument): void {
    if (!Global.enabled)
      return this.collection.clear()

    if (!isSupportedLanguageId(document.languageId))
      return

    const locale = Global.displayLanguage

    if (document) {
      const problems: Diagnostic[] = []

      const keys = KeyDetector.getKeys(document)
      // get all keys of current file
      keys.forEach(({ key, start, end }) => {
        const text = Global.loader.getValueByKey(key, locale)
        if (text)
          return

        problems.push({
          message: `${locale}: Translation of "${key}" is missing`,
          range: new Range(document.positionAt(start), document.positionAt(end)),
          severity: DiagnosticSeverity.Warning,
        })
      })

      this.collection.set(document.uri, problems)
    }
    else {
      this.collection.clear()
    }
  }
}

const m: ExtensionModule = (ctx: ExtensionContext) => {
  const provider = new ProblemProvider(ctx)

  if (window.activeTextEditor)
    provider.update(window.activeTextEditor.document)

  return window.onDidChangeActiveTextEditor(editor => {
    if (editor)
      provider.update(editor.document)
  })
}

export default m
