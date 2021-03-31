import { commands, DecorationRangeBehavior, Range, window } from 'vscode'
import { ExtensionModule } from '~/modules'
import { Global } from '~/core'
import { Commands } from '~/commands'
import { DetectionResult } from '~/extraction'
import i18n from '~/i18n'

const decoration = window.createTextEditorDecorationType({
  // TODO: configureable
  backgroundColor: '#edbe3230',
  border: '1px dashed #edbe32',
  borderRadius: '3px',
  rangeBehavior: DecorationRangeBehavior.ClosedClosed,
})

export async function DetectHardStrings() {
  const editor = window.activeTextEditor
  const doc = editor?.document

  if (!doc || !editor)
    return

  const frameworks = Global.getExtractionFrameworksByLang(doc.languageId)

  if (!frameworks.length) {
    window.showWarningMessage(i18n.t('refactor.extracting_not_support_for_lang'), doc.languageId)
    return
  }

  const result: DetectionResult[] = []

  for (const framework of frameworks) {
    const temp = framework.detectHardStrings?.(doc)
    if (temp && temp.length) {
      result.push(...temp.map(i => ({
        ...i,
        document: doc,
        editor,
      })))
    }
  }

  editor.setDecorations(
    decoration,
    result.flatMap((i) => {
      if (i.type !== 'inline')
        return new Range(doc.positionAt(i.start), doc.positionAt(i.end))

      let start = i.start

      // the start line with meaningful content
      let startLine = 0
      const lines = i.fullText!.split(/\n/g)
      return lines
        .map((part, idx) => {
          const leadingSpace = idx <= startLine
            ? (part.match(/^\s*/)?.[0] || '')
            : ''
          const tailingSpace = leadingSpace.length === part.length
            ? ''
            : part.match(/\s*$/)?.[0] || ''
          start += leadingSpace.length
          const end = start + (part.length - leadingSpace.length - tailingSpace.length)

          const range = start === end
            ? undefined!
            : new Range(doc.positionAt(start), doc.positionAt(end))
          start = end + 1

          if (idx === startLine && range == null)
            startLine += 1

          return range
        })
    })
      .filter(Boolean),
  )

  // window.showInformationMessage(result.map(i => i.text).join('\n'))

  return result
}

const m: ExtensionModule = () => {
  return [
    commands.registerCommand(Commands.detect_hard_strings, DetectHardStrings),
  ]
}

export default m
