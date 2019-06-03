import { Common } from '../core'
import { ExtensionModule } from '../modules'
import { Command, CodeActionProvider, window, commands, CodeActionKind, languages } from 'vscode'
// TODO:new engine
import transAndRefactor, { SAVE_TYPE } from '../legacy/transAndRefactor'

class ExtractProvider implements CodeActionProvider {
  public async provideCodeActions (): Promise<Command[]> {
    const editor = window.activeTextEditor
    if (!editor || !Common.hasI18nPaths)
      return

    const { selection } = editor
    const text = editor.document.getText(selection)
    if (!text || selection.start.line !== selection.end.line)
      return

    return [
      {
        command: 'extension.vue-i18n-ally.transAndSave',
        title: '提取文案为$t',
        arguments: [
          {
            filePath: editor.document.fileName,
            text,
            range: selection,
            type: SAVE_TYPE.$t,
          },
        ],
      },
      {
        command: 'extension.vue-i18n-ally.transAndSave',
        title: '提取文案为i18n.t',
        arguments: [
          {
            filePath: editor.document.fileName,
            text,
            range: selection,
            type: SAVE_TYPE.i18n,
          },
        ],
      },
    ]
  }
}

const m: ExtensionModule = () => {
  languages.registerCodeActionsProvider(
    [
      { language: 'vue', scheme: '*' },
      { language: 'javascript', scheme: '*' },
      { language: 'typescript', scheme: '*' },
    ],
    new ExtractProvider(),
    {
      providedCodeActionKinds: [CodeActionKind.Refactor],
    }
  )
  commands.registerCommand(
    'extension.vue-i18n-ally.transAndSave',
    transAndRefactor
  )
}

export default m
