import * as vscode from 'vscode'
import Common from './utils/Common'
import transAndRefactor, { SAVE_TYPE } from './utils/transAndRefactor'

class ExtractProvider implements vscode.CodeActionProvider {
  public async provideCodeActions(): Promise<vscode.Command[]> {
    const editor = vscode.window.activeTextEditor
    if (!editor || !Common.hasI18nPaths) {
      return
    }

    const { selection } = editor
    const text = editor.document.getText(selection)
    if (!text || selection.start.line !== selection.end.line) {
      return
    }

    return [
      {
        command: 'extension.vue-i18n-ally.transAndSave',
        title: '提取文案为$t',
        arguments: [
          {
            filePath: editor.document.fileName,
            text,
            range: selection,
            type: SAVE_TYPE.$t
          }
        ]
      },
      {
        command: 'extension.vue-i18n-ally.transAndSave',
        title: '提取文案为i18n.t',
        arguments: [
          {
            filePath: editor.document.fileName,
            text,
            range: selection,
            type: SAVE_TYPE.i18n
          }
        ]
      }
    ]
  }
}

export default (ctx: vscode.ExtensionContext) => {
  return [
    vscode.languages.registerCodeActionsProvider(
      [
        { language: 'vue', scheme: '*' },
        { language: 'javascript', scheme: '*' },
        { language: 'typescript', scheme: '*' }
      ],
      new ExtractProvider(),
      {
        providedCodeActionKinds: [vscode.CodeActionKind.Refactor]
      }
    ),
    vscode.commands.registerCommand(
      'extension.vue-i18n-ally.transAndSave',
      transAndRefactor
    )
  ]
}
