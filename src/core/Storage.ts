import { Config } from './Config'

export class Storage {
  static init() {
    this.get('install-date', () => +Date.now(), true)
  }

  static get installDate(): number {
    return this.get('install-date', () => +Date.now(), true)
  }

  static get previousVersion(): string | null {
    return this.get('previous-version')
  }

  static set previousVersion(v: string | null) {
    this.set('previous-version', v)
  }

  static get<T>(key: string, init?: () => T, writeback = true): T {
    let result = Config.ctx.globalState.get(`i18n-ally.${key}`) as T

    if (!result && init) {
      result = init()
      if (writeback)
        this.set(key, result)
    }
    return result
  }

  static set<T>(key: string, value: T): void {
    Config.ctx.globalState.update(`i18n-ally.${key}`, value)
  }

  static delete(key: string): void {
    Config.ctx.globalState.update(`i18n-ally.${key}`, undefined)
  }
}
