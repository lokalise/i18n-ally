import path from 'path'
import YAML from 'js-yaml'
import fs from 'fs-extra'
import { EventEmitter, window, workspace, FileSystemWatcher } from 'vscode'
import { get, set } from 'lodash'
import { nanoid } from 'nanoid'
import { cleanObject } from '../utils/cleanObject'
import { promptEdit } from '../utils/prompts'
import { FILEWATCHER_TIMEOUT } from '../meta'
import { Config } from './Config'
import { ReviewData, ReviewComment, ReviewCommentWithMeta, TranslationCandidate, TranslationCandidateWithMeta, PendingWrite } from './types'
import { CurrentFile } from './CurrentFile'
import { Log } from '~/utils'

export class Reviews {
  private filepath = ''
  private data: ReviewData = { reviews: {} }
  private _fileWatcher: FileSystemWatcher | undefined
  private mtime = 0

  private _onDidChange: EventEmitter<string | undefined> = new EventEmitter()
  readonly onDidChange = this._onDidChange.event

  init(rootpath: string) {
    this._fileWatcher?.dispose()
    this.filepath = path.join(rootpath, '.vscode/i18n-ally-reviews.yml')

    this._fileWatcher = workspace.createFileSystemWatcher(this.filepath)
    this._fileWatcher.onDidChange(() => setTimeout(() => this.load(), FILEWATCHER_TIMEOUT))
    this._fileWatcher.onDidCreate(() => setTimeout(() => this.load(), FILEWATCHER_TIMEOUT))
    this._fileWatcher.onDidDelete(() => setTimeout(() => this.load(), FILEWATCHER_TIMEOUT))

    return this.load()
  }

  private set(key: string, field: string, value?: any, locale?: string, save = true) {
    if (locale)
      set(this.data, ['reviews', key, 'locales', locale, field], value)
    else
      set(this.data, ['reviews', key, field], value)

    this._onDidChange.fire(key)
    if (save)
      return this.save()
  }

  private get(key: string, field: string, locale?: string) {
    if (locale)
      return get(this.data, ['reviews', key, 'locales', locale, field])
    else
      return get(this.data, ['reviews', key, field])
  }

  setDescription(key: string, description?: string) {
    return this.set(key, 'description', description)
  }

  getDescription(key: string): string |undefined {
    return this.get(key, 'description')
  }

  async setTranslationCandidates(items: {key: string; locale: string; translation?: TranslationCandidate}[]) {
    for (const { key, translation, locale } of items)
      await this.set(key, 'translation_candidate', translation, locale, false)
    this.save()
  }

  getTranslationCandidate(key: string, locale: string): TranslationCandidate | undefined {
    return this.get(key, 'translation_candidate', locale)
  }

  async applyTranslationCandidates(candidates: {keypath: string; locale: string}[]) {
    const pendings: PendingWrite[] = []

    for (const { keypath, locale } of candidates) {
      const translation = this.getTranslationCandidate(keypath, locale)
      if (!translation)
        break

      pendings.push({
        keypath,
        locale,
        value: translation.text,
      })
    }
    CurrentFile.loader.write(pendings)

    for (const { keypath, locale } of candidates)
      await this.discardTranslationCandidate(keypath, locale, false)

    await this.save()
  }

  async applyTranslationCandidate(key: string, locale: string, override?: string) {
    const translation = this.getTranslationCandidate(key, locale)
    if (!translation)
      return

    await CurrentFile.loader.write({
      keypath: key,
      locale,
      value: override || translation.text,
    })

    await this.discardTranslationCandidate(key, locale)
  }

  async discardTranslationCandidate(key: string, locale: string, save?: boolean) {
    await this.set(key, 'translation_candidate', undefined, locale, save)
  }

  async promptEditTranslation(key: any, locale: any) {
    const tc = this.getTranslationCandidate(key, locale)
    if (!tc)
      throw new ReferenceError(`No translation candidate found for ${key} on ${locale}`)
    let value: string | undefined = tc?.text
    value = await promptEdit(key, locale, value)
    if (value)
      await this.applyTranslationCandidate(key, locale, value.replace(/\\n/g, '\n'))
  }

  getReviews(key: string) {
    return (this.data?.reviews || {})[key] || {}
  }

  addComment(key: string, locale: string, comment: Partial<ReviewComment>) {
    const comments = this.get(key, 'comments', locale) || []
    comments.push({
      user: Config.reviewUser,
      id: nanoid(),
      ...comment,
      time: new Date().toISOString(),
    })
    return this.set(key, 'comments', comments, locale)
  }

  editComment(key: string, locale: string, data: Partial<ReviewComment> & {id: string}) {
    const comments: ReviewComment[] = this.get(key, 'comments', locale) || []
    const comment = comments.find(i => i.id === data.id)
    if (comment) {
      Object.assign(comment, data)
      return this.set(key, 'comments', comments, locale)
    }
  }

  getComments(key: string, locale: string, hideResolved = true) {
    const comments: ReviewComment[] = this.get(key, 'comments', locale) || []
    if (hideResolved)
      return comments.filter(i => !i.resolved)
    else
      return comments
  }

  getCommentById(key: string, locale: string, id: string) {
    const comments = this.getComments(key, locale, false)
    const comment = comments.find(i => i.id === id)
    return comment
  }

  getCommentsByLocale(locale: string, hideResolved = true): ReviewCommentWithMeta[] {
    return Object.keys(this.data?.reviews || {})
      .flatMap(keypath => this.getComments(keypath, locale, hideResolved)
        .map((i) => {
          return { ...i, locale, keypath } as ReviewCommentWithMeta
        }),
      )
  }

  getTranslationCandidatesLocale(locale: string) {
    return Object.keys(this.data?.reviews || {})
      .map((keypath) => {
        const i = this.getTranslationCandidate(keypath, locale)
        if (!i)
          return undefined
        return { ...i, locale, keypath } as TranslationCandidateWithMeta
      })
      .filter(i => i) as TranslationCandidateWithMeta[]
  }

  async resolveComment(key: string, locale: string, id: string) {
    const comments = this.getComments(key, locale, false)
    const comment = comments.find(i => i.id === id)

    if (comment) {
      if (Config.reviewRemoveCommentOnResolved)
        comments.splice(comments.indexOf(comment), 1)
      else
        comment.resolved = true
      await this.set(key, 'comments', comments, locale)
      return comment
    }
  }

  async applySuggestion(key: string, locale: string, id: string) {
    const comment = this.getCommentById(key, locale, id)
    if (comment && comment.suggestion) {
      await CurrentFile.loader.write({
        keypath: key,
        locale,
        value: comment.suggestion,
      })
      await this.resolveComment(key, locale, id)
    }
  }

  async promptEditDescription(keypath: string) {
    const value = await window.showInputBox({
      value: this.getDescription(keypath),
      prompt: `Description for "${keypath}"`,
      ignoreFocusOut: true,
    })
    if (value !== undefined)
      return this.setDescription(keypath, value)
  }

  private async load() {
    if (fs.existsSync(this.filepath)) {
      if (fs.statSync(this.filepath).mtimeMs === this.mtime)
        return

      Log.info('📤 Loading review data')
      const content = await fs.readFile(this.filepath, 'utf-8')
      this.data = YAML.load(content) as any || { reviews: {} }
    }
    else {
      this.data = { reviews: {} }
    }
    this.data.reviews = this.data.reviews || {}
    this._onDidChange.fire(undefined)
  }

  private async save() {
    Log.info('📥 Saving review data')
    this.data = cleanObject(this.data) || {}
    let content = YAML.dump(this.data, { skipInvalid: true })
    content = `# Review comments generated by i18n-ally. Please commit this file.\n\n${content}`
    await fs.writeFile(this.filepath, content, 'utf-8')
    this.mtime = fs.statSync(this.filepath).mtimeMs
  }
}
