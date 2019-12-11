import { OutputChannel, window } from 'vscode'
import { EXT_NAME } from '../meta'

export class Log {
  private static _channel: OutputChannel

  static get outputChannel (): OutputChannel {
    if (!this._channel)
      this._channel = window.createOutputChannel(EXT_NAME)
    return this._channel
  }

  static raw (...values: any[]) {
    this.outputChannel.appendLine(values.map(i => i.toString()).join(' '))
  }

  static info (message: string, intend = 0) {
    this.outputChannel.appendLine(`${'\t'.repeat(intend)}${message}`)
  }

  static warning (message: string, prompt = false, intend = 0) {
    if (prompt)
      window.showWarningMessage(message)
    Log.info(`⚠ WARN: ${message}`, intend)
  }

  static error (err: Error | string, prompt = true, intend = 0) {
    if (prompt)
      window.showErrorMessage(`${EXT_NAME} Error: ${err.toString()}`)
    if (typeof err === 'string')
      Log.info(`🐛 ERROR: ${err}`, intend)
    else
      Log.info(`🐛 ERROR: ${err.name}: ${err.message}\n${err.stack}`, intend)
  }

  static divider () {
    this.outputChannel.appendLine('\n――――――\n')
  }
}
