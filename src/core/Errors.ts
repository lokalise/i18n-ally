import i18n from '~/i18n'

export enum ErrorType {
  translating_same_locale = /* i18n */ 'errors.translating_same_locale',
  translating_unknown_error = /* i18n */ 'errors.translating_unknown_error',
  translating_empty_source_value = /* i18n */ 'errors.translating_empty_source_value',
  unsupported_file_type = /* i18n */ 'errors.unsupported_file_type',
  keystyle_not_set = /* i18n */ 'errors.keystyle_not_set',
  write_in_readonly_mode = /* i18n */ 'errors.write_in_readonly_mode',
}

export class AllyError extends Error {
  readonly args: any[] = []
  constructor(
    public readonly type: ErrorType,
    public readonly error?: Error,
    ...args: any[]) {
    // @ts-ignore
    super(i18n.t(type.toString(), ...args))
    this.args = args
  }

  get stack() {
    return this.error?.stack
  }
}
