import path from 'path'
import YAML from 'js-yaml'
import fs from 'fs-extra'
import { EventEmitter, Event } from 'vscode'

export interface ReviewData {
  reviews: Record<string, {
    description?: string
    locales?: Record<string, {
      suggestions?: { value?: string; comment?: string; by?: string }[]
      approved?: boolean
      request_change?: boolean
    }>
  }>
}

export class Reviews {
  private filepath = ''
  private data: ReviewData = { reviews: {} }

  private _onDidChange: EventEmitter<string> = new EventEmitter()
  readonly onDidChange: Event<string> = this._onDidChange.event

  init(rootpath: string) {
    this.filepath = path.join(rootpath, '.vscode/i18n-ally-reviews.yml')
    return this.load()
  }

  private set(key: string, field: string, value?: any, locale?: string) {
    if (!this.data.reviews[key])
      this.data.reviews[key] = {}

    if (locale) {
      if (!this.data.reviews[key].locales)
        this.data.reviews[key].locales = {}
      if (!this.data.reviews[key].locales![locale])
        this.data.reviews[key].locales![locale] = {}
      // @ts-ignore
      this.data.reviews[key].locales![locale][field] = value
    }
    else {
      // @ts-ignore
      this.data.reviews[key][field] = value
    }
    this._onDidChange.fire(key)
    return this.save()
  }

  setDescription(key: string, description?: string) {
    return this.set(key, 'description', description)
  }

  getDescription(key: string) {
    return this.data.reviews[key]?.description
  }

  setApprove(key: string, locale: string, value: boolean) {
    return this.set(key, 'approved', value, locale)
  }

  getReviews(key: string) {
    return this.data.reviews[key] || {}
  }

  private async load() {
    const content = await fs.readFile(this.filepath, 'utf-8')
    this.data = content
      ? { reviews: {} }
      : YAML.safeLoad(content)
  }

  private async save() {
    await fs.writeFile(this.filepath, YAML.safeDump(this.data), 'utf-8')
  }
}
