import * as vscode from 'vscode'
import LanguageCodes from '../meta/LanguageCodes'
import { LocaleLoader } from '.'
import * as fs from 'fs'

const configPrefix = 'vue-i18n-ally'

export class Global {
  static loader: LocaleLoader

  static get hasLocalesConfigured () {
    return !!Global.localesPaths.length
  }

  static get localesPaths (): string[] {
    const paths = Global.getConfig('localesPaths')

    return paths ? paths.split(',') : []
  }

  static updateLocalesPaths (paths: string[]) {
    const localesPaths = Array.from(new Set(Global.localesPaths.concat(paths)))
    Global.setConfig('localesPaths', localesPaths.join(','))
  }

  static get rootPath () {
    return vscode.workspace.rootPath || ''
  }

  static get displayLanguage (): string {
    return Global.normalizeLng(Global.getConfig('displayLanguage'))
  }

  static set displayLanguage (value) {
    Global.setConfig('displayLanguage', Global.normalizeLng(value))
  }

  static get sourceLanguage (): string {
    return Global.normalizeLng(Global.getConfig('sourceLanguage'), '') || this.displayLanguage || 'en'
  }

  static getConfig (key: string): any {
    return vscode.workspace.getConfiguration().get(`${configPrefix}.${key}`)
  }

  static setConfig (key: string, value: any, isGlobal = false) {
    return vscode.workspace
      .getConfiguration()
      .update(`${configPrefix}.${key}`, value, isGlobal)
  }

  static normalizeLng (locale: string, fallback = 'en'): string {
    const result = LanguageCodes.find(
      (codes: string | string[]) => {
        if (Array.isArray(codes) && codes.includes(locale))
          return true

        if (
          typeof codes === 'string' &&
          locale.toUpperCase() === codes.toUpperCase()
        )
          return true

        return false
      })

    return result
      ? (Array.isArray(result)
        ? result[0].toString()
        : result)
      : fallback
  }

  public static isVueProject (): boolean {
    if (!vscode.workspace.workspaceFolders)
      return false
    const projectUrl = this.rootPath

    try {
      const rawPackageJSON = fs.readFileSync(`${projectUrl}/package.json`, 'utf-8')
      const {
        dependencies,
        devDependencies,
      } = JSON.parse(rawPackageJSON)
      return !!dependencies['vue-i18n'] || !!devDependencies['vue-i18n']
    }
    catch (err) {
      return false
    }
  }

  public static getUid (len = 6): string {
    return Math.random()
      .toString(36)
      .substr(2, len)
  }
}
