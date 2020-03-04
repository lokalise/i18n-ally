import { window, workspace, extensions } from 'vscode'
import { trimEnd, uniq } from 'lodash'
import { normalizeLocale } from '../utils'
import i18n from '../i18n'
import { EXT_NAMESPACE, EXT_ID, EXT_LEGACY_NAMESPACE } from '../meta'
import { KeyStyle, DirStructureAuto } from '.'

export class Config {
  static readonly reloadConfigs = [
    'localesPaths',
    'filenameMatchRegex',
    'includeSubfolders',
    'enabledFrameworks',
    'enabledParsers',
    'encoding',
    'fileNamespace',
    'disablePathParsing',
  ]

  static readonly refreshConfigs = [
    'sourceLanguage',
    'ignoredLocales',
    'displayLanguage',
    'readonly',
  ]

  // languages
  static get displayLanguage(): string {
    return normalizeLocale(Config.getConfig<string>('displayLanguage') || '')
  }

  static set displayLanguage(value) {
    this.setConfig('displayLanguage', normalizeLocale(value), true)
  }

  static get sourceLanguage(): string {
    return normalizeLocale(this.getConfig<string>('sourceLanguage') || '', '') || this.displayLanguage || 'en'
  }

  static set sourceLanguage(value) {
    this.setConfig('sourceLanguage', normalizeLocale(value))
  }

  static get ignoredLocales(): string[] {
    const ignored = this.getConfig('ignoredLocales')
    if (!ignored)
      return []
    if (ignored && typeof ignored === 'string')
      return [ignored]
    if (Array.isArray(ignored))
      return ignored
    return []
  }

  static set ignoredLocales(value) {
    this.setConfig('ignoredLocales', value, true)
  }

  static get keyStyle(): KeyStyle {
    const style = this.getConfig<KeyStyle>('keystyle') || 'auto'
    if (style === 'auto' && this.disablePathParsing)
      return 'flat'
    return style
  }

  static set keyStyle(value: KeyStyle) {
    this.setConfig('keystyle', value, false)
  }

  static get annotations(): boolean {
    return this.getConfig<boolean>('annotations') ?? true
  }

  static set annotations(value: boolean) {
    this.setConfig('annotations', value, true)
  }

  static get annotationMaxLength(): number {
    return this.getConfig<number>('annotationMaxLength') || 40
  }

  static set annotationMaxLength(value: number) {
    this.setConfig('annotationMaxLength', value, true)
  }

  static get annotationDelimiter(): string {
    return this.getConfig<string>('annotationDelimiter') || ''
  }

  static get fileNamespace(): boolean | undefined {
    return this.getConfig<boolean>('fileNamespace')
  }

  static get enabledFrameworks(): string[] | undefined {
    let ids = this.getConfig<string | string[]>('enabledFrameworks')
    if (!ids)
      return undefined
    if (typeof ids === 'string')
      ids = [ids]
    return ids
  }

  static get enabledParsers(): string[] | undefined {
    let ids = this.getConfig<string | string[]>('enabledParsers')
    if (!ids)
      return undefined
    if (typeof ids === 'string')
      ids = [ids]
    return ids
  }

  static get dirStructure(): DirStructureAuto {
    return (this.getConfig('dirStructure')) as (DirStructureAuto) || 'auto'
  }

  static set dirStructure(value: DirStructureAuto) {
    this.setConfig('dirStructure', value, true)
  }

  static get sortKeys(): boolean {
    return this.getConfig<boolean>('sortKeys') || false
  }

  static get readonly(): boolean {
    return this.getConfig<boolean>('readonly') || false
  }

  static get includeSubfolders(): boolean {
    return this.getConfig<boolean>('includeSubfolders') || false
  }

  static get fullReloadOnChanged(): boolean {
    return this.getConfig<boolean>('fullReloadOnChanged') || false
  }

  static get preferredDelimiter(): string {
    return this.getConfig<string>('preferredDelimiter') || '-'
  }

  static get filenameMatchRegex(): string | undefined {
    return this.getConfig('filenameMatchRegex')
  }

  static get keepFulfilled(): boolean {
    return this.getConfig<boolean>('keepFulfilled') || false
  }

  static get frameworksRubyRailsScopeRoot(): string {
    return this.getConfig<string>('frameworks.ruby-rails.scopeRoot') || ''
  }

  static async requestKeyStyle(): Promise<KeyStyle | undefined> {
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

  static toggleLocaleVisibility(locale: string, visible?: boolean) {
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
  static get localesPaths(): string[] {
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

  static set localesPaths(paths: string[]) {
    if (paths.length === 1)
      this.setConfig('localesPaths', paths[0])
    else
      this.setConfig('localesPaths', paths)
  }

  static updateLocalesPaths(paths: string[]) {
    this.localesPaths = uniq(this.localesPaths.concat(paths))
  }

  static get hasLocalesConfigured() {
    return !!this.localesPaths.length
  }

  static get extension() {
    return extensions.getExtension(EXT_ID)
  }

  static get extensionPath() {
    if (this.extension)
      return this.extension.extensionPath
    return undefined
  }

  static get encoding() {
    return this.getConfig<string>('encoding') || 'auto'
  }

  static get indent() {
    return this.getConfig<number>('indent') ?? 2
  }

  static get tabStyle() {
    return this.getConfig<string>('tabStyle') === 'tab' ? '\t' : ' '
  }

  static get promptTranslatingSource() {
    return this.getConfig<boolean>('promptTranslatingSource') ?? false
  }

  static get disablePathParsing() {
    return this.getConfig<boolean>('disablePathParsing') ?? false
  }

  // config
  private static getConfig<T = any>(key: string): T | undefined {
    let config = workspace
      .getConfiguration(EXT_NAMESPACE)
      .get<T>(key)

    // compatible to vue-i18n-ally
    if (config === undefined) {
      config = workspace
        .getConfiguration(EXT_LEGACY_NAMESPACE)
        .get<T>(key)
    }

    return config
  }

  private static async setConfig(key: string, value: any, isGlobal = false) {
    // transfer legacy config
    if (workspace
      .getConfiguration(EXT_LEGACY_NAMESPACE)
      .get<any>(key)
    ) {
      await workspace.getConfiguration(EXT_LEGACY_NAMESPACE)
        .update(key, undefined, isGlobal)
    }

    // update value
    return await workspace
      .getConfiguration(EXT_NAMESPACE)
      .update(key, value, isGlobal)
  }
}
