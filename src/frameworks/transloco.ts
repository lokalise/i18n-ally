import { TextDocument } from 'vscode'
import { LanguageId } from '../utils'
import { Framework, ScopeRange } from './base'

export default class TranslocoFramework extends Framework {
  id = 'transloco'
  display = 'Angular Transloco'

  detection = {
    packageJSON: [
      '@ngneat/transloco',
    ],
  }

  languageIds: LanguageId[] = [
    'javascript',
    'typescript',
    'html',
  ]

  usageMatchRegex = [
    // https://netbasal.gitbook.io/transloco/translation-in-the-template/pipe
    '[`\'"]({key})[`\'"][\\s\\n]*\\|[\\s\\n]*transloco',
    // https://netbasal.gitbook.io/transloco/translation-in-the-template/structural-directive
    '[^\\w\\d](?:t|translate|selectTranslate|getTranslateObject|selectTranslateObject|getTranslation|setTranslationKey)\\([\\s\\n]*[\'"`]({key})[\'"`]',
    // https://netbasal.gitbook.io/transloco/translation-in-the-template/attribute-directive
    '[^*\\w\\d]transloco=[\'"`]({key})[\'"`]',
  ]

  refactorTemplates(keypath: string, languageId: string) {
    return [
      `{{ '${keypath}' | transloco }}`,
      `t('${keypath}')`,
      keypath,
    ]
  }

  getScopeRange(document: TextDocument): ScopeRange[] | undefined {
    if (document.languageId !== 'html')
      return

    const text = document.getText()

    // TODO: change to a real html parser, to match with correct end tag
    const regex = /<ng-container \*transloco=".*read:\s*'(.+).*'">[\s\S]*<\/ng-container>/gm

    const ranges: ScopeRange[] = []

    let match = null
    while (match = regex.exec(text)) {
      ranges.push({
        scope: match[1],
        start: match.index,
        end: match.index + match[0].length,
      })
    }

    return ranges
  }
}
