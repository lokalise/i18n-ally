import path from 'path'
import { Framework } from '../base'
import { LanguageId } from '../../utils'
import { RewriteKeySource, DataProcessContext, RewriteKeyContext } from '../../core/types'
import { Config, Global } from '../../core'

class RubyRailsFramework extends Framework {
  id= 'ruby-rails'
  display= 'Ruby on Rails'

  detection = {
    gemfile: [
      'rails-i18n',
    ],
  }

  languageIds: LanguageId[] = [
    'ruby',
    'haml',
    'erb',
  ]

  // for visualize the regex, you can use https://regexper.com/
  keyMatchReg = [
    /[^\w\d]t(?:\(| )['"`]([[\w\d\. \-\[\]]*?)['"`]/g,
  ]

  refactorTemplates (keypath: string) {
    return [
      `t(".${keypath}")`,
      keypath,
    ]
  }

  preprocessData (data: any, context: DataProcessContext): object {
    return data[context.locale || ''] || {}
  }

  deprocessData (data: any, context: DataProcessContext): object {
    return {
      [context.locale || '']: data,
    }
  }

  rewriteKeys (key: string, source: RewriteKeySource, context: RewriteKeyContext = {}) {
    if (source === 'reference' && key.startsWith('.') && context.targetFile) {
      const root = path.resolve(Global.rootpath, Config.frameworksRubyRailsScopeRoot)
      let scope = path.relative(root, context.targetFile)
      if (scope.endsWith('.html.erb'))
        scope = scope.slice(0, -9)
      scope = scope.replace(/(?:\/|\\)/g, '.')
      return scope + key
    }
    return key
  }
}

export default RubyRailsFramework
