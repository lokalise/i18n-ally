import { commands, Range, window } from 'vscode'
import { GoToRange } from './gotoRange'
import { CurrentFile, KeyDetector, KeyInDocument } from '~/core'
import { Commands } from '~/extension'
import { ExtensionModule } from '~/modules'

export function GoToNextUsage() {
  const editor = window.activeTextEditor
  const document = editor?.document
  if (!editor || !document)
    return

  const usages = KeyDetector.getUsages(document, CurrentFile.loader)
  if (!usages?.keys.length)
    return

  const current = document.offsetAt(editor.selection.start)

  function getDiff(i: KeyInDocument) {
    const diff = current - i.start
    if (diff < 0)
      return Infinity
    return diff
  }

  const last = Array.from(usages.keys).sort((a, b) => getDiff(a) - getDiff(b))[0]

  if (!last)
    return

  const index = usages.keys.indexOf(last)
  const next = (index + 1) % usages.keys.length
  const nextKey = usages.keys[next]

  if (!nextKey)
    return

  const range = new Range(document.positionAt(nextKey.start), document.positionAt(nextKey.end))
  GoToRange(document, range)
}

export default <ExtensionModule> function() {
  return [
    commands.registerCommand(Commands.go_to_next_usage, GoToNextUsage),
  ]
}
