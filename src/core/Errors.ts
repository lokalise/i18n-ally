import { window } from 'vscode'
import { Global } from './Global'

export enum ErrorType {
  translating_same_locale,
  translating_unknown_error,
  translating_empty_source_value,
  filepath_not_specified,
  unsupported_file_type,
  keystyle_not_set
}

export class AllyError extends Error {
  constructor (
    public readonly type: ErrorType,
    public readonly data?: any,
    public readonly errors?: Error | Error[]) {
    super(ErrorType[type].toString())
  }

  toString () {
    return ErrorType[this.type].toString()
  }
}

export function LogError (err: Error | string) {
  window.showErrorMessage(err.toString())
  if (typeof err === 'string')
    Global.outputChannel.appendLine(`ERROR: ${err}`)
  else
    Global.outputChannel.appendLine(`ERROR: ${err.name}: ${err.message}\n${err.stack}`)
}
