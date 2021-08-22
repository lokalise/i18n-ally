// import { Range, TextDocument } from 'vscode'
// import Parser, { Node } from 'php-parser'
import { Framework } from './base'
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

  // TODO: not working yet
  // supportAutoExtraction = ['php']

  // _engine: Parser = undefined!

  // detectHardStrings(doc: TextDocument) {
  //   if (doc.languageId !== 'php')
  //     return undefined

  //   const text = doc.getText()

  //   const engine = this._engine = this._engine || new Parser({
  //     parser: {
  //       extractDoc: true,
  //     },
  //     ast: {
  //       withPositions: true,
  //     },
  //   })

  //   const ast = engine.parseCode(text)

  //   // console.log('AST', ast)

  //   function searchFor(name: string, node: any = ast): Node[] {
  //     if (!node)
  //       return []
  //     if (node.kind === name)
  //       return [node]
  //     if (node.expression)
  //       return searchFor(name, node.expression)
  //     if (node.left || node.right) {
  //       return [
  //         ...searchFor(name, node.left),
  //         ...searchFor(name, node.right),
  //       ]
  //     }
  //     if (!node?.children?.length)
  //       return []
  //     return node.children.flatMap((i: any) => {
  //       return searchFor(name, i)
  //     })
  //   }

  //   const stringNodes = searchFor('string')

  //   console.log('STRINGS', stringNodes)

  //   const strings: HardStringInfo[] = stringNodes.map((i: any) => ({
  //     range: new Range(
  //       doc.positionAt(i.loc.start.offset),
  //       doc.positionAt(i.loc.end.offset),
  //     ),
  //     value: i.value,
  //   }))

  //   return strings
  // }
}

export default LaravelFramework
