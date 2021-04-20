import { TextDocument } from 'vscode'
import { Parser } from 'htmlparser2'
import { Framework, ScopeRange } from './base'
import { LanguageId } from '~/utils'

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

  refactorTemplates(keypath: string) {
    return [
      `{{ '${keypath}' | transloco }}`,
      `t('${keypath}')`,
      keypath,
    ]
  }

  // support for `read` syntax
  // https://ngneat.github.io/transloco/docs/translation-in-the-template#utilizing-the-read-input
  getScopeRange(document: TextDocument): ScopeRange[] | undefined {
    if (document.languageId !== 'html')
      return

    const ranges: ScopeRange[] = []

    const regex = /^.*read:\s*['"](.+?)['"].*$/
    const tagStack: string[] = []
    let stackDepth = -1
    let namespace = ''
    let start = 0

    const parser = new Parser(
      {
        onopentag(name, attribs) {
          tagStack.push(name)
          const attr = attribs['*transloco']
          if (attr && parser.endIndex != null) {
            if (!regex.test(attr))
              return
            namespace = attr.replace(regex, '$1')
            start = parser.startIndex
            stackDepth = tagStack.length
          }
        },
        onclosetag() {
          if (tagStack.length === stackDepth) {
            if (namespace) {
              ranges.push({
                namespace,
                start,
                end: parser.endIndex ?? parser.startIndex,
              })
            }
            stackDepth = -1
            namespace = ''
            start = 0
          }
          tagStack.pop()
        },
      },
      { decodeEntities: true },
    )
    parser.write(document.getText())
    parser.end()

    return ranges
  }
}
