import { EventEmitter } from 'vscode'
import { google, baidu, youdao } from 'translation.js'
import { TranslateResult } from 'translation.js/declaration/api/types'
import { Log } from '../utils'
import { AllyError, ErrorType } from './Errors'
import { LocaleTree } from './types'
import { LocaleNode, LocaleRecord, Config, Loader, CurrentFile } from '.'

interface TranslatorChangeEvent {
  keypath: string
  locale: string
  action: 'start' | 'end'
}

export class Translator {
  private static translatingKeys: {keypath: string; locale: string}[] = []
  private static _onDidChange = new EventEmitter<TranslatorChangeEvent>()
  static readonly onDidChange = Translator._onDidChange.event

  static async MachineTranslate (loader: Loader, node: LocaleNode| LocaleRecord, sourceLanguage?: string, targetLocales?: string[]) {
    sourceLanguage = sourceLanguage || Config.sourceLanguage
    if (node.type === 'node')
      return await this.MachineTranslateNode(loader, node, sourceLanguage, targetLocales)

    await this.MachineTranslateRecord(loader, node, sourceLanguage)
  }

  static isTranslating (node: LocaleNode| LocaleRecord | LocaleTree) {
    if (node.type === 'record')
      return !!this.translatingKeys.find(i => i.keypath === node.keypath && i.locale === node.locale)
    if (node.type === 'node')
      return !!this.translatingKeys.find(i => i.keypath === node.keypath)
    if (node.type === 'tree')
      return !!this.translatingKeys.find(i => i.keypath.startsWith(node.keypath))
    return false
  }

  private static start (keypath: string, locale: string, update = true) {
    this.end(keypath, locale, false)
    this.translatingKeys.push({ keypath, locale })
    if (update)
      this._onDidChange.fire({ keypath, locale, action: 'start' })
  }

  private static end (keypath: string, locale: string, update = true) {
    this.translatingKeys = this.translatingKeys.filter(i => !(i.keypath === keypath && i.locale === locale))
    if (update)
      this._onDidChange.fire({ keypath, locale, action: 'end' })
  }

  private static async MachineTranslateRecord (loader: Loader, record: LocaleRecord, sourceLanguage: string) {
    if (record.locale === sourceLanguage)
      throw new AllyError(ErrorType.translating_same_locale)
    const sourceNode = loader.getNodeByKey(record.keypath)
    if (!sourceNode)
      throw new AllyError(ErrorType.translating_empty_source_value)
    const sourceRecord = sourceNode.locales[sourceLanguage]
    if (!sourceRecord || !sourceRecord.value)
      throw new AllyError(ErrorType.translating_empty_source_value)
    try {
      Log.info(`🌍 Translating "${record.keypath}" (${sourceLanguage}->${record.locale})`)
      this.start(record.keypath, record.locale)
      const result = await this.translateText(sourceRecord.value, sourceLanguage, record.locale)
      this.end(record.keypath, record.locale)

      const pending = {
        locale: record.locale,
        value: result,
        filepath: record.filepath,
        keypath: record.keypath,
      }
      await CurrentFile.loader.write(pending)
    }
    catch (e) {
      this.end(record.keypath, record.locale)
      throw new AllyError(ErrorType.translating_unknown_error, undefined, e)
    }
  }

  private static async MachineTranslateNode (loader: Loader, node: LocaleNode, sourceLanguage: string, targetLocales?: string[]) {
    const tasks = Object.values(loader.getShadowLocales(node, targetLocales))
      .filter(record => record.locale !== sourceLanguage)
      .map(record => this.MachineTranslateRecord(loader, record, sourceLanguage))

    await Promise.all(tasks)
  }

  private static async translateText (text: string, from: string, to: string) {
    const plans = [google, baidu, youdao]
    let trans_result: TranslateResult | undefined

    const errors: Error[] = []

    for (const plan of plans) {
      try {
        trans_result = await plan.translate({ text, from, to, com: true })
        break
      }
      catch (e) {
        errors.push(e)
      }
    }

    const result = trans_result && (trans_result.result || []).join('\n')

    if (!result)
      throw errors

    return result
  }
}
