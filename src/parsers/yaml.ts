import YAML from 'js-yaml'
import YamlLex from 'yaml'
import _ from 'lodash'
import { Parser } from './base'
import { KeyInDocument, Config } from '~/core'

export class YamlParser extends Parser {
  id = 'yaml'

  constructor() {
    super(['yaml'], 'ya?ml')
  }

  async parse(text: string) {
    return YAML.load(text, Config.parserOptions?.yaml?.load) as Object
  }

  async dump(object: object, sort: boolean) {
    object = JSON.parse(JSON.stringify(object))
    return YAML.dump(object, {
      indent: this.options.indent,
      sortKeys: sort,
      ...Config.parserOptions?.yaml?.dump,
    })
  }

  annotationSupported = true
  annotationLanguageIds = ['yaml']

  parseAST(text: string) {
    const cst = YamlLex.parseCST(text)
    cst.setOrigRanges() // Workaround for CRLF eol, https://github.com/eemeli/yaml/issues/127
    const doc = new YamlLex.Document({ keepCstNodes: true }).parse(cst[0])

    const findPairs = (node: any, path: string[] = []): KeyInDocument[] => {
      if (!node)
        return []
      if (node.type === 'MAP' || node.type === 'SEQ')
      // @ts-ignore
        return _.flatMap(node.items, m => findPairs(m, path))
      if (node.type === 'PAIR' && node.value != null && node.key != null) {
        if (!['BLOCK_FOLDED', 'BLOCK_LITERAL', 'PLAIN', 'QUOTE_DOUBLE', 'QUOTE_SINGLE'].includes(node.value.type)) {
          return findPairs(node.value, [...path, node.key.toString()])
        }
        else {
          const valueCST = node.value.cstNode
          if (!valueCST || !valueCST.valueRange)
            return []
          const { start, end, origStart, origEnd } = valueCST.valueRange
          const key = [...path, node.key.toString()].join('.')

          return [{
            start: (origStart || start) + 1,
            end: (origEnd || end) - 1,
            key,
            quoted: true,
          }]
        }
      }

      return []
    }

    return findPairs(doc.contents)
  }
}
