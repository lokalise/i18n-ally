import { commands, Range, Selection, TextEditor, TextEditorRevealType, window } from 'vscode'
import { Commands } from '~/extension'
import { ExtensionModule } from '~/modules'

export function GoToRange(editor: TextEditor, range: Range) {
  if (editor && range) {
    editor.selection = new Selection(
      range.end,
      range.start,
    )
    editor.revealRange(editor.selection, TextEditorRevealType.InCenter)
  }
}

const m: ExtensionModule = () => {
  return [
    commands.registerCommand(Commands.go_to_range, GoToRange),
  ]
}

export default m
