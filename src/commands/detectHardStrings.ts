import { relative } from 'path'
import { commands, window } from 'vscode'
import { ExtensionModule } from '~/modules'
import { Global, DetectionResult, Config } from '~/core'
import { Commands } from '~/commands'
import { trimDetection } from '~/extraction'
import i18n from '~/i18n'

export async function DetectHardStrings(document = window.activeTextEditor?.document, warn = true) {
  if (!document)
    return

  const frameworks = Global.getExtractionFrameworksByLang(document.languageId)

  if (!frameworks.length) {
    if (warn)
      window.showWarningMessage(i18n.t('refactor.extracting_not_support_for_lang', document.languageId))
    return
  }

  let result: DetectionResult[] = []

  for (const framework of frameworks) {
    const temp = (framework.detectHardStrings?.(document) || [])
      .filter(Boolean)
      .map(trimDetection)
      .filter(Boolean)
      .map(i => ({
        ...i,
        document,
      })) as DetectionResult[]

    if (temp.length)
      result.push(...temp)
  }

  // filter out ignored results
  const ignored = Config.extractIgnored
  const ignoredByFiles = Config.extractIgnoredByFiles[relative(Config.root, document.uri.fsPath)] || []
  result = result.filter(r => !ignored.includes(r.text) && !ignoredByFiles.includes(r.text))

  return result
}

export default <ExtensionModule> function m() {
  return [
    commands.registerCommand(Commands.detect_hard_strings, DetectHardStrings),
  ]
}
