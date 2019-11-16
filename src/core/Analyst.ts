import { resolve } from 'path'
import { workspace, Range, Location, TextDocument } from 'vscode'
import * as fg from 'fast-glob'
import { SUPPORTED_LANG_GLOBS } from '../meta'
import { Log, File } from '../utils'
import { Global } from './Global'
import { KeyDetector, Config } from '.'

export interface Occurrence {
  keypath: string
  filepath: string
  start: number
  end: number
}

export class Analyst {
  private static _cache: Occurrence[] | null = null

  static invalidateCache () {
    this._cache = null
  }

  static invalidateCacheOf (filepath: string) {
    if (this._cache)
      this._cache = this._cache.filter(o => o.filepath !== filepath)
  }

  static watch () {
    return workspace.onDidSaveTextDocument(doc => this.updateCache(doc))
  }

  private static async updateCache (doc: TextDocument) {
    if (!this._cache)
      return
    if (!Global.isLanguageIdSupported(doc.languageId))
      return

    const filepath = doc.uri.fsPath
    Log.info(`Update cache of ${filepath}`)
    this.invalidateCacheOf(filepath)
    const occurrences = await this.getOccurrencesOfText(doc.getText(), filepath)
    this._cache.push(...occurrences)
  }

  private static async getDocumentPaths () {
    const root = workspace.rootPath
    if (!root)
      return []

    const ignore = [ // TODO: read from gitignore, configs
      'node_modules',
      '**/**/node_modules',
      'dist',
      '**/**/dist',
      '**/**/coverage',
      ...Config.localesPaths,
    ]
    const files = await fg(SUPPORTED_LANG_GLOBS, {
      cwd: root,
      ignore,
    })

    return files.map(f => resolve(root, f))
  }

  private static async getOccurrencesOfFile (filepath: string) {
    const text = await File.read(filepath)
    return await this.getOccurrencesOfText(text, filepath)
  }

  private static async getOccurrencesOfText (text: string, filepath: string) {
    const keys = KeyDetector.getKeys(text)
    const occurrences: Occurrence[] = []

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

  static async getAllOccurrences (targetKey?: string) {
    if (!this._cache) {
      const occurrences: Occurrence[] = []
      const filepaths = await this.getDocumentPaths()

      for (const filepath of filepaths)
        occurrences.push(...await this.getOccurrencesOfFile(filepath))

      this._cache = occurrences
    }

    if (targetKey)
      return this._cache.filter(({ keypath }) => keypath === targetKey)
    return this._cache
  }

  static async getAllOccurrenceLocations (targetKey: string) {
    const occurrences = await this.getAllOccurrences(targetKey)
    return await Promise.all(occurrences.map(o => this.getLocationOf(o)))
  }

  static async getLocationOf (occurrence: Occurrence) {
    const document = await workspace.openTextDocument(occurrence.filepath)
    const range = new Range(
      document.positionAt(occurrence.start),
      document.positionAt(occurrence.end),
    )
    return new Location(document.uri, range)
  }
}
