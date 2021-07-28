import { window, Disposable, StatusBarAlignment } from 'vscode'
import { Commands } from '../commands/commands'
import { ExtensionModule } from '~/modules'
import { Config, Global, CurrentFile } from '~/core'
import i18n from '~/i18n'

const statusbar: ExtensionModule = () => {
  const disposables: Disposable[] = []
  const priority = -1000
  const bar1 = window.createStatusBarItem(StatusBarAlignment.Right, priority + 1)
  const bar2 = window.createStatusBarItem(StatusBarAlignment.Right, priority)
  function update() {
    if (!Global.enabled) {
      bar1.hide()
      bar2.hide()
      return
    }
    try {
      bar1.text = `$(globe) ${Config.sourceLanguage.toUpperCase()}`
      bar1.command = Commands.config_source_language
      bar1.tooltip = i18n.t('command.config_source_language')
      bar1.show()
      bar2.text = `$(eye) ${Config.displayLanguage.toUpperCase()}`
      bar2.command = Commands.config_display_language
      bar2.tooltip = i18n.t('command.config_display_language')
      bar2.show()
    }
    catch (e) {
      bar1.hide()
      bar2.hide()
    }
  }

  disposables.push(CurrentFile.loader.onDidChange(() => update()))

  update()

  return disposables
}

export default statusbar
