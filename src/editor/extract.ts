import { Global } from '../core'
import { ExtensionModule } from '../modules'
import { Command, CodeActionProvider, window, commands, CodeActionKind, languages } from 'vscode'
// TODO:new engine
import transAndRefactor, { SAVE_TYPE } from '../legacy/transAndRefactor'
import language_selectors from './language_selectors'

class ExtractProvider implements CodeActionProvider {
  public async provideCodeActions (): Promise<Command[]> {
    const editor = window.activeTextEditor
    if (!editor || !Global.hasI18nPaths)
      return []

    const { selection } = editor
    const text = editor.document.getText(selection)
    if (!text || selection.start.line !== selection.end.line)
      return []

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
  return [
    languages.registerCodeActionsProvider(
      language_selectors,
      new ExtractProvider(),
      {
        providedCodeActionKinds: [CodeActionKind.Refactor],
      }
    ),
    commands.registerCommand(
      'extension.vue-i18n-ally.transAndSave',
      transAndRefactor
    ),
  ]
}

export default m
