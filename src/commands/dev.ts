import { commands, window } from 'vscode'
import { Commands } from '../core'
import { ExtensionModule } from '../modules'
import { SFCLoader } from '../core/SfcLoader'

const m: ExtensionModule = (ctx) => {
  return [
    commands.registerCommand(Commands.dev_load_sfc,
      async () => {
        const editor = window.activeTextEditor
        if (!editor)
          return
        if (editor.document.languageId !== 'vue')
          return
        const loader = new SFCLoader(editor.document.uri.fsPath)
        loader.load()
      }),
  ]
}

export default m
