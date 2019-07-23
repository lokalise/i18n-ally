import { EventEmitter } from 'vscode'
import { google, baidu, youdao } from 'translation.js'
import { TranslateResult } from 'translation.js/declaration/api/types'
import { Log } from '../utils'
import { AllyError, ErrorType } from './Errors'
import { Global } from './Global'
import { LocaleTree } from './types'
import { LocaleLoader, LocaleNode, LocaleRecord, Config } from '.'

interface TranslatorChangeEvent {
  keypath: string
  locale: string
  action: 'start' | 'end'
}

export class Translator {
  private translatingKeys: {keypath: string; locale: string}[] = []
  private _onDidChange = new EventEmitter<TranslatorChangeEvent>()
  readonly onDidChange = this._onDidChange.event

  constructor (
    readonly loader: LocaleLoader
  ) {}

  async MachineTranslate (node: LocaleNode| LocaleRecord, sourceLanguage?: string) {
    sourceLanguage = sourceLanguage || Config.sourceLanguage
    if (node.type === 'node')
      return await this.MachineTranslateNode(node, sourceLanguage)

    await this.MachineTranslateRecord(node, sourceLanguage)
  }

  isTranslating (node: LocaleNode| LocaleRecord | LocaleTree) {
    if (node.type === 'record')
      return !!this.translatingKeys.find(i => i.keypath === node.keypath && i.locale === node.locale)
    if (node.type === 'node')
      return !!this.translatingKeys.find(i => i.keypath === node.keypath)
    if (node.type === 'tree')
      return !!this.translatingKeys.find(i => i.keypath.startsWith(node.keypath))
    return false
  }

  private start (keypath: string, locale: string, update = true) {
    this.end(keypath, locale, false)
    this.translatingKeys.push({ keypath, locale })
    if (update)
      this._onDidChange.fire({ keypath, locale, action: 'start' })
  }

  private end (keypath: string, locale: string, update = true) {
    this.translatingKeys = this.translatingKeys.filter(i => !(i.keypath === keypath && i.locale === locale))
    if (update)
      this._onDidChange.fire({ keypath, locale, action: 'end' })
  }

  private async MachineTranslateRecord (record: LocaleRecord, sourceLanguage: string) {
    if (record.locale === sourceLanguage)
      throw new AllyError(ErrorType.translating_same_locale)
    const sourceNode = this.loader.getNodeByKey(record.keypath)
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
      await Global.loader.writeToFile(pending)
    }
    catch (e) {
      this.end(record.keypath, record.locale)
      throw new AllyError(ErrorType.translating_unknown_error, undefined, e)
    }
  }

  private async MachineTranslateNode (node: LocaleNode, sourceLanguage: string) {
    const tasks = Object.values(this.loader.getShadowLocales(node))
      .filter(record => record.locale !== sourceLanguage)
      .map(record => this.MachineTranslateRecord(record, sourceLanguage))

    await Promise.all(tasks)
  }

  private async translateText (text: string, from: string, to: string) {
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
