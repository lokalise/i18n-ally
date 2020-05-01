import { OutputChannel, window } from 'vscode'
import { EXT_NAME_SERVER } from '../meta'

export class ServerLog {
  private static _channel: OutputChannel

  static get outputChannel(): OutputChannel {
    if (!this._channel)
      this._channel = window.createOutputChannel(EXT_NAME_SERVER)
    return this._channel
  }

  static log(...values: any[]) {
    this.outputChannel.appendLine(values.map(i => i.toString()).join(' '))
  }

  static show() {
    this.outputChannel.show()
  }
}
