import { EventEmitter, CancellationToken, window, ProgressLocation, commands } from 'vscode'
import { TranslateResult, TranslateOptions } from 'translation.js/declaration/api/types'
import { google, baidu, youdao } from 'translation.js'
import i18n from '../i18n'
import { Log } from '../utils'
import { AllyError, ErrorType } from './Errors'
import { PendingWrite } from './types'
import { LocaleTree, LocaleNode, LocaleRecord, Config, Loader, Commands } from '.'

interface TranslatorChangeEvent {
  keypath: string
  locale: string
  action: 'start' | 'end'
}

export interface TranslateJob {
  loader: Loader
  locale: string
  keypath: string
  source: string
  filepath?: string
  token?: CancellationToken
}

export type AccaptableTranslateItem =
  | LocaleNode
  | LocaleRecord
  | {locale: string; keypath: string; type: undefined}

const Services: Record<string, (options: TranslateOptions) => Promise<TranslateResult>> = {
  google: (options: TranslateOptions) => google.translate({ ...options, com: true }),
  'google-cn': (options: TranslateOptions) => google.translate({ ...options, com: false }),
  baidu: baidu.translate,
  youdao: youdao.translate,
}

export class Translator {
  private static translatingKeys: {keypath: string; locale: string}[] = []
  private static _onDidChange = new EventEmitter<TranslatorChangeEvent>()
  static readonly onDidChange = Translator._onDidChange.event

  // #region utils
  private static start(keypath: string, locale: string, update = true) {
    this.end(keypath, locale, false)
    this.translatingKeys.push({ keypath, locale })
    if (update)
      this._onDidChange.fire({ keypath, locale, action: 'start' })
  }

  private static end(keypath: string, locale: string, update = true) {
    this.translatingKeys = this.translatingKeys.filter(i => !(i.keypath === keypath && i.locale === locale))
    if (update)
      this._onDidChange.fire({ keypath, locale, action: 'end' })
  }

  static isTranslating(node: LocaleNode| LocaleRecord | LocaleTree) {
    if (node.type === 'record')
      return !!this.translatingKeys.find(i => i.keypath === node.keypath && i.locale === node.locale)
    if (node.type === 'node')
      return !!this.translatingKeys.find(i => i.keypath === node.keypath)
    if (node.type === 'tree')
      return !!this.translatingKeys.find(i => i.keypath.startsWith(node.keypath))
    return false
  }

  private static getValueOfKey(loader: Loader, keypath: string, sourceLanguage: string) {
    const sourceNode = loader.getNodeByKey(keypath)
    if (!sourceNode) {
      if (Config.translateFallbackToKey)
        return keypath
      throw new AllyError(ErrorType.translating_empty_source_value)
    }

    const sourceRecord = sourceNode.locales[sourceLanguage]
    if (!sourceRecord || !sourceRecord.value) {
      if (Config.translateFallbackToKey)
        return keypath
      throw new AllyError(ErrorType.translating_empty_source_value)
    }

    return sourceRecord.value
  }
  // #endregion

  static async translateNodes(
    loader: Loader,
    nodes: AccaptableTranslateItem[],
    sourceLanguage: string,
    targetLocales?: string[],
  ) {
    if (!nodes.length)
      return

    window.withProgress({
      location: ProgressLocation.Notification,
      title: i18n.t('prompt.translate_in_progress'),
      cancellable: true,
    },
    async(progress, token) => {
      const jobs = this.getTranslateJobs(loader, nodes, sourceLanguage, targetLocales, token)

      const successJobs: TranslateJob[] = []
      const failedJobs: [TranslateJob, Error][] = []
      let finished = 0
      const total = jobs.length

      const increment = 1 / total * 100

      const doJob = async(job: TranslateJob) => {
        let pending: PendingWrite | undefined
        const message = `"${job.keypath}" (${job.source}->${job.locale}) ${finished + 1}/${total}`
        progress.report({ increment: 0, message })
        try {
          pending = await this.translateJob(job)
          successJobs.push(job)
        }
        catch (err) {
          failedJobs.push([job, err])
        }
        finished += 1
        progress.report({ increment, message })
        return pending
      }

      const parallels = Config.translateParallels
      const slices = Math.ceil(jobs.length / parallels)
      for (let i = 0; i < slices; i++) {
        const pendings = await Promise.all(
          jobs
            .slice(i * parallels, (i + 1) * parallels)
            .map(job => doJob(job)),
        )
        // @ts-ignore
        loader.write(pendings.filter(i => i))
      }

      if (successJobs.length === 1) {
        const job = successJobs[0]
        const editButton = i18n.t('prompt.translate_edit_translated')
        const result = await window.showInformationMessage(
          i18n.t('prompt.translate_missing_done_single', job.keypath),
          editButton,
        )
        if (result === editButton)
          commands.executeCommand(Commands.edit_key, { keypath: job.keypath, locale: job.locale })
      }
      else if (successJobs.length > 0) {
        window.showInformationMessage(i18n.t('prompt.translate_missing_done', successJobs.length))
      }

      if (failedJobs.length) {
        for (const [job, error] of failedJobs) {
          Log.info(`🌎⚠️ Failed to translate "${job.keypath}" (${job.source}->${job.locale})`)
          Log.error(error, false)
        }

        const message = failedJobs.length === 1
          ? i18n.t('prompt.translate_failed_single', failedJobs[0][0].keypath, failedJobs[0][0].locale)
          : i18n.t('prompt.translate_failed_many', failedJobs.length)

        Log.error(message)
      }
    })
  }

  static getTranslateJobs(
    loader: Loader,
    nodes: AccaptableTranslateItem[],
    sourceLanguage: string,
    targetLocales?: string[],
    token?: CancellationToken,
  ): TranslateJob[] {
    let jobs: TranslateJob[] = []

    for (const node of nodes) {
      if (!node.type) {
        jobs.push({
          loader,
          locale: node.locale,
          keypath: node.keypath,
          source: sourceLanguage,
          token,
        })
      }
      else if (node.type === 'record') {
        jobs.push({
          loader,
          locale: node.locale,
          keypath: node.keypath,
          filepath: node.filepath,
          source: sourceLanguage,
          token,
        })
      }
      else {
        jobs = jobs.concat(
          Object.values(loader.getShadowLocales(node, targetLocales))
            .filter(record => record.locale !== sourceLanguage)
            .map(record => ({
              loader,
              locale: record.locale,
              keypath: record.keypath,
              filepath: record.filepath,
              source: sourceLanguage,
              token,
            })),
        )
      }
    }
    return jobs
  }

  static async translateJob(
    request: TranslateJob,
  ) {
    const { loader, locale, keypath, filepath, token, source } = request
    if (token?.isCancellationRequested)
      return

    if (locale === source)
      throw new AllyError(ErrorType.translating_same_locale)

    const value = this.getValueOfKey(loader, keypath, source)

    try {
      Log.info(`🌍 Translating "${keypath}" (${source}->${locale})`)
      this.start(keypath, locale)
      const result = await this.translateText(value, source, locale)
      this.end(keypath, locale)

      if (token?.isCancellationRequested)
        return

      const pending: PendingWrite = {
        locale,
        value: result,
        filepath,
        keypath,
      }

      return pending
    }
    catch (e) {
      this.end(keypath, locale)
      throw e
    }
  }

  private static async translateText(text: string, from: string, to: string) {
    const services = Config.translateServices.map(i => Services[i])
    let trans_result: TranslateResult | undefined

    const errors: Error[] = []

    for (const translate of services) {
      try {
        trans_result = await translate({ text, from, to })
        break
      }
      catch (e) {
        errors.push(e)
      }
    }

    const result = trans_result && (trans_result.result || []).join('\n')

    if (!result)
      throw errors[0]

    return result
  }
}
