import { Config } from '../../core'
import { unicodeProgressBar, unicodeDecorate } from '../../utils'
import { ProgressMissingListItem } from './ProgressMissingListItem'
import { ProgressEmptyListItem } from './ProgressEmptyListItem'
import { ProgressBaseItem } from './ProgressBaseItem'
import { ProgressTranslatedListItem } from './ProgressTranslatedListItem'

export class ProgressRootItem extends ProgressBaseItem {
  get description (): string {
    const rate = this.node.translated / this.node.total
    const percent = +(rate * 100).toFixed(1)
    const progress = unicodeProgressBar(Math.round(percent))
    let description = `${progress}  ${percent}%  (${this.node.translated}/${this.node.total})`
    if (this.isSource)
      description += unicodeDecorate('  source', 'regional_indicator')
    else if (this.isDisplay)
      description += unicodeDecorate('  display', 'regional_indicator')
    return description
  }

  get locale () {
    return this.node.locale
  }

  get visible () {
    return !Config.ignoredLocales.includes(this.locale)
  }

  get isSource () {
    return this.locale === Config.sourceLanguage
  }

  get isDisplay () {
    return this.locale === Config.displayLanguage
  }

  get iconPath () {
    if (!this.visible)
      return this.getIcon('eye-off-fade')
    return this.getFlagIcon(this.locale)
  }

  get contextValue () {
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

  async getChildren () {
    return [
      new ProgressTranslatedListItem(this),
      new ProgressEmptyListItem(this),
      new ProgressMissingListItem(this),
    ]
  }
}
