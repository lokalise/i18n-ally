import { window, Disposable, StatusBarAlignment } from 'vscode'
import { ExtensionModule } from '../modules'
import { Config, Global } from '../core'
import { Commands } from '../core/Commands'

const statusbar: ExtensionModule = (ctx) => {
  const disposables: Disposable[] = []
  const bar = window.createStatusBarItem(StatusBarAlignment.Left)
  function update () {
    if (!Global.enabled)
      return bar.hide()
    try {
      bar.text = `$(globe) ${Config.sourceLanguage.toUpperCase()} → ${Config.displayLanguage.toUpperCase()}`
      bar.command = Commands.config_display_language
      bar.show()
    }
    catch (e) {
      bar.hide()
    }
  }

  disposables.push(Global.onDidChangeEnabled(() => update()))
  disposables.push(Global.loader.onDidChange(() => update()))

  update()

  return disposables
}

export default statusbar
