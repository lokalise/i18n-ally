import { window, workspace } from 'vscode'
import { trimEnd, uniq } from 'lodash'
import { normalizeLocale } from '../utils'
import i18n from '../i18n'
import { KeyStyle } from '.'

export class Config {
  static readonly extensionNamespace = 'vue-i18n-ally'

  static readonly reloadConfigs = [
    'localesPaths',
    'matchRegex',
  ]

  static readonly refreshConfigs = [
    'sourceLanguage',
    'ignoredLocales',
    'displayLanguage',
    'readonly',
  ]

  // #region ====== Configurations ======

  // languages
  static get displayLanguage (): string {
    return normalizeLocale(Config.getConfig<string>('displayLanguage') || '')
  }

  static set displayLanguage (value) {
    this.setConfig('displayLanguage', normalizeLocale(value), true)
  }

  static get sourceLanguage (): string {
    return normalizeLocale(this.getConfig<string>('sourceLanguage') || '', '') || this.displayLanguage || 'en'
  }

  static set sourceLanguage (value) {
    this.setConfig('sourceLanguage', normalizeLocale(value))
  }

  static get ignoredLocales (): string[] {
    const ignored = this.getConfig('ignoredLocales')
    if (!ignored)
      return []
    if (ignored && typeof ignored === 'string')
      return [ignored]
    if (Array.isArray(ignored))
      return ignored
    return []
  }

  static set ignoredLocales (value) {
    this.setConfig('ignoredLocales', value, true)
  }

  static get keyStyle (): KeyStyle {
    return this.getConfig<KeyStyle>('keystyle') || 'auto'
  }

  static set keyStyle (value: KeyStyle) {
    this.setConfig('keystyle', value, false)
  }

  static get annotations (): boolean {
    return this.getConfig<boolean>('annotations') || false
  }

  static set annotations (value: boolean) {
    this.setConfig('annotations', value, true)
  }

  static get annotationMaxLength (): number {
    return this.getConfig<number>('annotationMaxLength') || 0
  }

  static set annotationMaxLength (value: number) {
    this.setConfig('annotationMaxLength', value, true)
  }

  static get forceEnabled (): boolean {
    return this.getConfig<boolean>('forceEnabled') || false
  }

  static get dirStructure (): 'auto' | 'file' | 'dir' {
    return (this.getConfig('dirStructure')) as ('auto' | 'file' | 'dir')
  }

  static set dirStructure (value: 'auto' | 'file' | 'dir') {
    this.setConfig('dirStructure', value, true)
  }

  static get sortKeys (): boolean {
    return this.getConfig<boolean>('sortKeys') || false
  }

  static get readonly (): boolean {
    return this.getConfig<boolean>('readonly') || false
  }

  static getMatchRegex (dirStructure = this.dirStructure): string {
    let regex = (this.getConfig('matchRegex')) as string
    if (!regex) {
      if (dirStructure)
        regex = '^([\\w-_]*)\\.(json5?|ya?ml|jsx?|tsx?|mjs)$'
      else
        regex = '^(.*)\\.(json5?|ya?ml|jsx?|tsx?|mjs)$'
    }
    return regex
  }

  static async requestKeyStyle (): Promise<KeyStyle | undefined> {
    if (this.keyStyle !== 'auto')
      return this.keyStyle

    const result = await window.showQuickPick([{
      value: 'nested',
      label: i18n.t('prompt.keystyle_nested'),
      description: i18n.t('prompt.keystyle_nested_example'),
    }, {
      value: 'flat',
      label: i18n.t('prompt.keystyle_flat'),
      description: i18n.t('prompt.keystyle_flat_example'),
    }], {
      placeHolder: i18n.t('prompt.keystyle_select'),
    })

    if (!result) {
      this.keyStyle = 'nested'
      return 'nested'
    }
    this.keyStyle = result.value as KeyStyle
    return result.value as KeyStyle
  }

  static toggleLocaleVisibility (locale: string, visible?: boolean) {
    const ignored = this.ignoredLocales
    if (visible == null)
      visible = !ignored.includes(locale)
    if (!visible) {
      ignored.push(locale)
      this.ignoredLocales = ignored
    }
    else {
      this.ignoredLocales = ignored.filter(i => i !== locale)
    }
  }

  // locales
  static get localesPaths (): string[] {
    const paths = this.getConfig('localesPaths')
    let localesPaths: string[]
    if (!paths)
      localesPaths = []
    else if (typeof paths === 'string')
      localesPaths = paths.split(',')
    else
      localesPaths = paths || []
    return localesPaths.map(i => trimEnd(i, '/\\'))
  }

  static set localesPaths (paths: string[]) {
    if (paths.length === 1)
      this.setConfig('localesPaths', paths[0])
    else
      this.setConfig('localesPaths', paths)
  }

  static updateLocalesPaths (paths: string[]) {
    this.localesPaths = uniq(this.localesPaths.concat(paths))
  }

  static get hasLocalesConfigured () {
    return !!this.localesPaths.length
  }

  // config
  private static getConfig<T = any> (key: string): T | undefined {
    return workspace
      .getConfiguration(this.extensionNamespace)
      .get<T>(key)
  }

  private static setConfig (key: string, value: any, isGlobal = false) {
    return workspace
      .getConfiguration(this.extensionNamespace)
      .update(key, value, isGlobal)
  }

  // #endregion
}
