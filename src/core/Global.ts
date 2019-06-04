import { workspace, commands } from 'vscode'
import { LocaleLoader } from '.'
import { uniq } from 'lodash'
import { normalizeLocale } from './utils'

const configPrefix = 'vue-i18n-ally'

export class Global {
  static loader: LocaleLoader

  static async init () {
    this.loader = new LocaleLoader()
    await this.loader.init()
    commands.executeCommand('setContext', 'vue-i18n-ally-enabled', true)
  }

  static get rootPath () {
    // TODO: dynamic change base on current workspace
    return workspace.rootPath || ''
  }

  // languages
  static get displayLanguage (): string {
    return normalizeLocale(Global.getConfig('displayLanguage'))
  }

  static set displayLanguage (value) {
    Global.setConfig('displayLanguage', normalizeLocale(value))
  }

  static get sourceLanguage (): string {
    return normalizeLocale(Global.getConfig('sourceLanguage'), '') || this.displayLanguage || 'en'
  }

  // locales
  static get localesPaths (): string[] {
    const paths = Global.getConfig('localesPaths')
    return paths ? paths.split(',') : []
  }

  static set localesPaths (paths: string[]) {
    Global.setConfig('localesPaths', paths.join(','))
  }

  static updateLocalesPaths (paths: string[]) {
    this.localesPaths = uniq(Global.localesPaths.concat(paths))
  }

  static get hasLocalesConfigured () {
    return !!this.localesPaths.length
  }

  // config
  private static getConfig (key: string): any {
    return workspace
      .getConfiguration()
      .get(`${configPrefix}.${key}`)
  }

  private static setConfig (key: string, value: any, isGlobal = false) {
    return workspace
      .getConfiguration()
      .update(`${configPrefix}.${key}`, value, isGlobal)
  }
}
