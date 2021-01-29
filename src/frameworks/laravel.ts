import { Range, TextDocument } from 'vscode'
import { Framework, HardStringInfo } from './base'
import { LanguageId } from '~/utils'

class LaravelFramework extends Framework {
  id = 'laravel'
  display = 'Laravel'
  monopoly = true

  detection = {
    composerJSON: [
      'laravel/framework',
    ],
  }

  languageIds: LanguageId[] = [
    'php',
    'blade',
  ]

  enabledParsers = ['php']

  // for visualize the regex, you can use https://regexper.com/
  usageMatchRegex = [
    '[^\\w\\d](?:__|trans|@lang|trans_choice)\\([\'"`]({key})[\'"`]',
  ]

  refactorTemplates(keypath: string) {
    return [
      `__('${keypath}')`,
      `trans_choice('${keypath}')`,
      `trans('${keypath}')`,
      `@lang('${keypath}')`,
      keypath,
    ]
  }

  enableFeatures = {
    namespace: true,
  }

  pathMatcher = () => '{locale}/**/{namespace}.{ext}'

  rewriteKeys(keypath: string) {
    return keypath.replace(/\//g, '.')
  }

  supportAutoExtraction = true

  getHardStrings(doc: TextDocument) {
    if (doc.languageId !== 'php')
      return undefined

    const text = doc.getText()
    const strings: HardStringInfo[] = []

    for (const match of text.matchAll(/["'](.*?)['"]/g)) {
      if (!match || match.index == null)
        continue
      const start = match.index
      const end = start + match[0].length

      strings.push({
        range: new Range(doc.positionAt(start), doc.positionAt(end)),
      })
    }

    return strings
  }
}

export default LaravelFramework
