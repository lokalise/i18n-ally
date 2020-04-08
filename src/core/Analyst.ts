import { resolve, join } from 'path'
import fs from 'fs'
import { workspace, Range, Location, TextDocument, Uri, EventEmitter } from 'vscode'
// @ts-ignore
import { glob } from 'glob-gitignore'
// @ts-ignore
import parseGitIgnore from 'parse-gitignore'
import _, { uniq } from 'lodash'
import { Log } from '../utils'
import { Global } from './Global'
import { CurrentFile } from './CurrentFile'
import { UsageReport } from './types'
import { KeyDetector, Config, KeyOccurrence, KeyUsage } from '.'

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
    Log.info(`Update cache of ${filepath}`)
    this.invalidateCacheOf(filepath)
    const occurrences = await this.getOccurrencesOfText(doc, filepath)
    this._cache.push(...occurrences)
  }

  private static async enumerateDocumentPaths() {
    const root = workspace.rootPath
    if (!root)
      return []

    let ignore = [
      'node_modules',
      'dist',
      ...Config.localesPaths,
    ]

    const gitignorePath = join(root, '.gitignore')
    try {
      if (fs.existsSync(gitignorePath))
        ignore = ignore.concat(parseGitIgnore(await fs.promises.readFile(gitignorePath)))
    }
    catch (e) {
      Log.error(e)
    }

    const files = await glob(Global.getSupportLangGlob(), {
      cwd: root,
      ignore,
    }) as string[]

    // TODO: configs for custom ignore

    return files.map(f => resolve(root, f))
      .filter(f => !fs.lstatSync(f).isDirectory())
  }

  private static async getOccurrencesOfFile(filepath: string) {
    const doc = await workspace.openTextDocument(Uri.file(filepath))
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

  static async analyzeUsage(useCache = true): Promise<UsageReport> {
    const occurrences = await this.getAllOccurrences(undefined, useCache)
    const usages: KeyUsage[] = _(occurrences)
      .groupBy('keypath')
      .entries()
      .map(([keypath, occurrences]) => ({ keypath, occurrences }))
      .value()

    const usingKeys = uniq([...usages.map(i => i.keypath), ...Config.keysInUse])

    const activeKeys = usingKeys.filter(i => CurrentFile.loader.getNodeByKey(i, false))
    const missingKeys = usingKeys.filter(i => !activeKeys.includes(i))
    const idleKeys = CurrentFile.loader.keys.filter(i => !usingKeys.includes(i))

    const idleUsages = idleKeys.map(i => ({ keypath: i, occurrences: [] }))

    const report = {
      active: usages.filter(i => activeKeys.includes(i.keypath)),
      missing: usages.filter(i => missingKeys.includes(i.keypath)),
      idle: idleUsages,
    }
    this._onDidUsageReportChanged.fire(report)
    return report
  }
}
