import { TextDocument } from 'vscode'
import { Framework } from './base'
import { DetectionResult } from '~/core'
import { LanguageId } from '~/utils'

class TypesafeI18nFramework extends Framework {
  id = 'typesafe-i18n'
  display = 'typesafe-i18n'

  monopoly = true

  detection = {
    packageJSON: [
      'typesafe-i18n',
    ],
  }

  enabledParsers = ['ts', 'js']

  pathMatcher = () => '{locale}/index.{ext}'

  languageIds: LanguageId[] = [
    'javascript',
    'typescript',
    'javascriptreact',
    'typescriptreact',
    'svelte',
    'html',
  ]

  usageMatchRegex = [
    '\\$?LL\\.({key})\\(((\\{.*\\})|([^)]*))\\)',
  ]

  perferredKeystyle = 'nested' as const

  perferredLocalePaths = ['src/i18n']

  private replaceKeypath = (keypath: string, text: string) =>
    text.replace('$1', keypath.split('.').map(part => `['${part}']`).join(''))

  private getHtmlRefactorTemplates = (keypath: string, params: string) => [
    `{LL{key}(${params})}`, // other
    `{$LL{key}(${params})}`, // svelte
  ].map(text => this.replaceKeypath(keypath, text))

  private getJavaScriptRefactorTemplates = (keypath: string, params: string) => [
    `LL{key}(${params})`, // other
    `$LL{key}(${params})`, // svelte
  ].map(text => this.replaceKeypath(keypath, text))

  refactorTemplates(keypath: string, args: string[] = [], _doc?: TextDocument, detection?: DetectionResult) {
    let params = ''
    if (args.length)
      params += `${args.join(', ')}`

    switch (detection?.source) {
      case 'html-inline':
      case 'html-attribute':
        return this.getHtmlRefactorTemplates(keypath, params)
      case 'js-string':
      case 'js-template':
      case 'jsx-text':
        return this.getJavaScriptRefactorTemplates(keypath, params)
    }

    return [
      ...this.getHtmlRefactorTemplates(keypath, params),
      ...this.getJavaScriptRefactorTemplates(keypath, params),
    ]
  }
}

export default TypesafeI18nFramework
