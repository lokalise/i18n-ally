import { ExtensionContext, languages, DiagnosticCollection, window, TextDocument, Diagnostic, DiagnosticSeverity, Range, workspace, Uri } from 'vscode'
import { EXT_NAMESPACE } from '../meta'
import { ExtensionModule } from '~/modules'
import { Global, KeyDetector, Config, Loader, CurrentFile, DetectionResult } from '~/core'
import i18n from '~/i18n'

export const PROBLEM_CODE_HARD_STRING = 'i18n-ally-hard-string'
export const PROBLEM_KEY_MISSING = 'i18n-ally-key-missing'
export const PROBLEM_TRANSLATION_MISSING = 'i18n-ally-translation-missing'

export interface DiagnosticWithDetection extends Diagnostic {
  detection?: DetectionResult
}

export interface DiagnosticWithKey extends Diagnostic {
  key?: string
}

export class ProblemProvider {
  private collection: DiagnosticCollection

  constructor(public readonly ctx: ExtensionContext) {
    this.collection = languages.createDiagnosticCollection(EXT_NAMESPACE)
  }

  update(document?: TextDocument): void {
    if (!Global.enabled)
      return this.collection.clear()

    if (!document)
      document = window.activeTextEditor?.document

    if (!document || !Global.isLanguageIdSupported(document.languageId))
      return

    const locale = Config.displayLanguage
    const loader: Loader = CurrentFile.loader

    const problems: (DiagnosticWithDetection | DiagnosticWithKey)[] = []

    if (CurrentFile.hardStrings?.length) {
      for (const detection of CurrentFile.hardStrings) {
        problems.push({
          code: PROBLEM_CODE_HARD_STRING,
          message: i18n.t('command.possible_hard_string'),
          range: new Range(document.positionAt(detection.start), document.positionAt(detection.end)),
          severity: DiagnosticSeverity.Warning,
          detection,
        })
      }
    }

    const keys = KeyDetector.getKeys(document)
    // get all keys of current file
    for (const { key, start, end } of keys) {
      const has_translation = !!loader.getValueByKey(key, locale)
      if (has_translation)
        continue

      const exists = !!loader.getNodeByKey(key)

      if (exists) {
        problems.push({
          code: PROBLEM_TRANSLATION_MISSING,
          message: i18n.t('misc.missing_translation', locale, key),
          range: new Range(document.positionAt(start), document.positionAt(end)),
          severity: DiagnosticSeverity.Information,
          key,
        })
      }
      else {
        problems.push({
          code: PROBLEM_KEY_MISSING,
          message: i18n.t('misc.missing_key', locale, key),
          range: new Range(document.positionAt(start), document.positionAt(end)),
          severity: DiagnosticSeverity.Information,
          key,
        })
      }
    }

    this.collection.set(document.uri, problems)
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

  provider.update()

  return [
    CurrentFile.onHardStringDetected(() => provider.update()),
    CurrentFile.loader.onDidChange(() => provider.update()),
    workspace.onDidChangeTextDocument(doc => provider.update(doc.document)),
    workspace.onDidCloseTextDocument(e => provider.clearUri(e.uri)),
  ]
}

export default m
