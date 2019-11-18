import { window, workspace, extensions } from 'vscode'
import { trimEnd, uniq } from 'lodash'
import { normalizeLocale } from '../utils'
import i18n from '../i18n'
import { MATCH_REG_DIR, MATCH_REG_FILE, EXT_NAMESPACE, EXT_ID } from '../meta'
import { KeyStyle } from '.'

export class Config {
  static readonly reloadConfigs = [
    'localesPaths',
    'filenameMatchRegex',
    'includeSubfolders',
    'encoding',
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

  static get annotationDelimiter (): string {
    return this.getConfig<string>('annotationDelimiter') || ''
  }

  static get forceEnabled (): boolean | string[] {
    return this.getConfig<boolean|string[]>('forceEnabled') || false
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

  static get sfc (): boolean {
    return this.getConfig<boolean>('experimental.sfc') || false
  }

  static get includeSubfolders (): boolean {
    return this.getConfig<boolean>('includeSubfolders') || false
  }

  static get fullReloadOnChanged (): boolean {
    return this.getConfig<boolean>('fullReloadOnChanged') || false
  }

  static get preferredDelimiter (): string {
    return this.getConfig<string>('preferredDelimiter') || '-'
  }

  static getMatchRegex (dirStructure = this.dirStructure): string {
    let regex = (this.getConfig('filenameMatchRegex')) as string
    if (!regex) {
      if (dirStructure === 'file')
        regex = MATCH_REG_FILE
      else
        regex = MATCH_REG_DIR
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

  static get extension () {
    return extensions.getExtension(EXT_ID)
  }

  static get extensionPath () {
    if (this.extension)
      return this.extension.extensionPath
    return undefined
  }

  static get encoding () {
    return this.getConfig<string>('encoding') || 'auto'
  }

  // config
  private static getConfig<T = any> (key: string): T | undefined {
    return workspace
      .getConfiguration(EXT_NAMESPACE)
      .get<T>(key)
  }

  private static setConfig (key: string, value: any, isGlobal = false) {
    return workspace
      .getConfiguration(EXT_NAMESPACE)
      .update(key, value, isGlobal)
  }

  // #endregion
}
