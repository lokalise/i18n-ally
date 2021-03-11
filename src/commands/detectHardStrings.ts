import { commands, DecorationRangeBehavior, Range, window } from 'vscode'
import { ExtensionModule } from '~/modules'
import { Global } from '~/core'
import { Commands } from '~/commands'
import { DetectionResult } from '~/extraction'

const decoration = window.createTextEditorDecorationType({
  // TODO: configureable
  backgroundColor: '#edbe3230',
  border: '1px dashed #edbe32',
  borderRadius: '3px',
  rangeBehavior: DecorationRangeBehavior.OpenOpen,
})

export async function DetectHardStrings() {
  const editor = window.activeTextEditor
  const doc = editor?.document

  if (!doc || !editor)
    return

  const frameworks = Global.enabledFrameworks.filter(i => i.supportAutoExtraction?.includes(doc.languageId))

  if (!frameworks.length) {
    window.showWarningMessage(`Extracting for language "${doc.languageId}" is not supported yet`)
    return
  }

  const result: DetectionResult[] = []

  for (const framework of frameworks) {
    const temp = framework.detectHardStrings?.(doc)
    if (temp && temp.length)
      result.push(...temp)
  }

  editor.setDecorations(
    decoration,
    result.map(i => new Range(doc.positionAt(i.start), doc.positionAt(i.end))),
  )

  window.showInformationMessage(result.map(i => i.text).join('\n'))

  return result
}

const m: ExtensionModule = () => {
  return [
    commands.registerCommand(Commands.detect_hard_strings, DetectHardStrings),
  ]
}

export default m
