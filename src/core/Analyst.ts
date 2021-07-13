import fs from 'fs'
import { workspace, Range, Location, TextDocument, Uri, EventEmitter } from 'vscode'
import micromatch from 'micromatch'
import _, { uniq } from 'lodash'
import { Global } from './Global'
import { CurrentFile } from './CurrentFile'
import { UsageReport } from './types'
import { KeyDetector, Config, KeyOccurrence, KeyUsage } from '.'
import { Log } from '~/utils'
import { gitignoredGlob } from '~/utils/glob'

export class Analyst {
  private static _cache: KeyOccurrence[] | null = null
  static readonly _onDidUsageReportChanged = new EventEmitter<UsageReport>()
  static readonly onDidUsageReportChanged = Analyst._onDidUsageReportChanged.event

  static invalidateCache() {
    this._cache = null
  }

  static invalidateCacheOf(filepath: string) {
    if (this._cache)
      this._cache = this._cache.filter(o => o.filepath !== filepath)
  }

  static watch() {
    return workspace.onDidSaveTextDocument(doc => this.updateCache(doc))
  }

  static hasCache() {
    return !!this._cache
  }

  static refresh() {
    if (this.hasCache())
      this.analyzeUsage(true)
  }

  private static async updateCache(doc: TextDocument) {
    if (!this._cache)
      return
    if (!Global.isLanguageIdSupported(doc.languageId))
      return

    const filepath = doc.uri.fsPath
    Log.info(`🔄 Update usage cache of ${filepath}`)
    this.invalidateCacheOf(filepath)
    const occurrences = await this.getOccurrencesOfText(doc, filepath)
    this._cache.push(...occurrences)
  }

  private static async enumerateDocumentPaths() {
    const root = Global.rootpath
    const files = await gitignoredGlob(Global.getSupportLangGlob(), root)
    return files.filter(f => !fs.lstatSync(f).isDirectory())
  }

  private static async getOccurrencesOfFile(filepath: string) {
    let doc = workspace.textDocuments.find(doc => doc.uri.fsPath === filepath)
    if (!doc)
      doc = await workspace.openTextDocument(Uri.file(filepath))
    return await this.getOccurrencesOfText(doc, filepath)
  }

  private static async getOccurrencesOfText(doc: TextDocument, filepath: string) {
    const keys = KeyDetector.getKeys(doc)
    const occurrences: KeyOccurrence[] = []

    for (const { start, end, key } of keys) {
      occurrences.push({
        keypath: key,
        start,
        end,
        filepath,
      })
    }

    return occurrences
  }

  static async getAllOccurrences(targetKey?: string, useCache = true) {
    if (!useCache)
      this._cache = null

    if (!this._cache) {
      const occurrences: KeyOccurrence[] = []
      const filepaths = await this.enumerateDocumentPaths()

      for (const filepath of filepaths)
        occurrences.push(...await this.getOccurrencesOfFile(filepath))

      this._cache = occurrences
    }

    if (targetKey)
      return this._cache.filter(({ keypath }) => keypath === targetKey)
    return this._cache
  }

  static async getAllOccurrenceLocations(targetKey: string) {
    const occurrences = await this.getAllOccurrences(targetKey)
    return await Promise.all(occurrences.map(o => this.getLocationOf(o)))
  }

  static async getLocationOf(occurrence: KeyOccurrence) {
    const document = await workspace.openTextDocument(occurrence.filepath)
    const range = new Range(
      document.positionAt(occurrence.start),
      document.positionAt(occurrence.end),
    )
    return new Location(document.uri, range)
  }

  static normalizeKey(key: string) {
    return key.replace(/\[(.*)\]/g, '.$1')
  }

  static async analyzeUsage(useCache = true): Promise<UsageReport> {
    const occurrences = await this.getAllOccurrences(undefined, useCache)
    const usages: KeyUsage[] = _(occurrences)
      .groupBy('keypath')
      .entries()
      .map(([keypath, occurrences]) => ({ keypath, occurrences }))
      .value()

    // all the keys you have
    const allKeys = CurrentFile.loader.keys.map(i => this.normalizeKey(i))
    // keys occur in your code
    const inUseKeys = uniq([...usages.map(i => i.keypath), ...Config.keysInUse].map(i => this.normalizeKey(i)))

    // keys in use
    const activeKeys = inUseKeys.filter(i => allKeys.includes(i))
    // keys not in use
    let idleKeys = allKeys
      .filter(i => !inUseKeys.includes(i))
      .filter(i => !micromatch.isMatch(i, Config.keysInUse))
    // keys in use, but actually you don't have them
    const missingKeys = inUseKeys.filter(i => !allKeys.includes(i))

    // remove dervied keys from idle, if the source key is in use
    const rules = Global.derivedKeyRules
    idleKeys = idleKeys.filter((key) => {
      for (const r of rules) {
        const match = r.exec(key)
        if (match && match[1] && activeKeys.includes(match[1]))
          return false
      }
      return true
    })

    const report = {
      active: usages.filter(i => activeKeys.includes(i.keypath)),
      missing: usages.filter(i => missingKeys.includes(i.keypath)),
      idle: idleKeys.map(i => ({ keypath: i, occurrences: [] })),
    }

    this._onDidUsageReportChanged.fire(report)
    return report
  }
}
