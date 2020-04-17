import { Config, Global } from '../../core'
import { unicodeProgressBar, unicodeDecorate } from '../../utils'
import { ProgressMissingListItem } from './ProgressMissingListItem'
import { ProgressEmptyListItem } from './ProgressEmptyListItem'
import { ProgressBaseItem } from './ProgressBaseItem'
import { ProgressTranslatedListItem } from './ProgressTranslatedListItem'
import { ReviewRequestChangesRoot } from './ReviewRequestChangesRoot'
import { BaseTreeItem } from './Base'
import { ReviewTranslationCandidates } from './ReviewTranslationCandidates'

export class ProgressRootItem extends ProgressBaseItem {
  get description(): string {
    const rate = this.node.translated / this.node.total
    const percent = +(rate * 100).toFixed(1)
    const progressStyle = process.platform === 'darwin' ? 2 : 7
    const progress = unicodeProgressBar(Math.round(percent), progressStyle)
    let description = `${progress}  ${percent}%  (${this.node.translated}/${this.node.total})`
    if (this.isSource)
      description += unicodeDecorate('  source', 'regional_indicator')
    else if (this.isDisplay)
      description += unicodeDecorate('  display', 'regional_indicator')
    return description
  }

  get locale() {
    return this.node.locale
  }

  get visible() {
    return !Config.ignoredLocales.includes(this.locale)
  }

  get isSource() {
    return this.locale === Config.sourceLanguage
  }

  get isDisplay() {
    return this.locale === Config.displayLanguage
  }

  get iconPath() {
    if (!this.visible)
      return this.getIcon('hidden', false)
    return this.getFlagIcon(this.locale)
  }

  get contextValue() {
    const context = ['progress']
    if (!this.isSource)
      context.push('notsource')
    if (!this.isDisplay)
      context.push('notdisply')
    if (!this.visible)
      context.push('show')
    else if (!this.isDisplay) // should not hide if it's displaying
      context.push('hide')
    context.push('openable')
    return context.join('-')
  }

  async getChildren() {
    const items: BaseTreeItem[] = [
      new ProgressTranslatedListItem(this),
      new ProgressEmptyListItem(this),
      new ProgressMissingListItem(this),
    ]
    if (Config.reviewEnabled) {
      const comments = Global.reviews.getCommentsByLocale(this.locale)
      const translations = Global.reviews.getTranslationCandidatesLocale(this.locale)
      const change_requested = comments.filter(c => c.type === 'request_change')
      if (change_requested.length)
        items.push(new ReviewRequestChangesRoot(this.ctx, change_requested))
      if (translations.length)
        items.push(new ReviewTranslationCandidates(this.ctx, translations))
    }
    return items
  }
}
