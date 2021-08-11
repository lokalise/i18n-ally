import { Config } from './Config'

export class Storage {
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
