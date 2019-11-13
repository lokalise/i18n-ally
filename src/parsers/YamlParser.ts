import * as yaml from 'js-yaml'
import YAML from 'yaml'
import { TextDocument } from 'vscode'
import _ from 'lodash'
import { KeyStyle } from '../core'
import { Parser, KeyInDocument } from './Parser'

export class YamlParser extends Parser {
  constructor () {
    super(['yaml'], /\.?ya?ml$/g)
  }

  async parse (text: string) {
    return yaml.safeLoad(text)
  }

  async dump (object: object, sort: boolean) {
    object = JSON.parse(JSON.stringify(object))
    return yaml.safeDump(object, {
      indent: this.options.indent,
      sortKeys: sort,
    })
  }

  navigateToKey (text: string, keypath: string, keystyle: KeyStyle) {
    const keys = keystyle === 'flat'
      ? [keypath]
      : keypath.split('.')

    let regexString = keys
      .map((key, i) => `^[ \\t]{${i * this.options.indent}}${key}: ?`)
      .join('[\\s\\S]*')
    regexString += ' (.*)$'
    const regex = new RegExp(regexString, 'gm')

    const match = regex.exec(text)
    if (match && match.length >= 2) {
      const end = match.index + match[0].length
      const value = match[1]
      const start = end - value.length
      return { start, end }
    }
    else {
      return undefined
    }
  }

  annotationSupported = true
  annotationLanguageIds = ['yaml']
  annotationGetKeys (document: TextDocument) {
    const text = document.getText()

    const cst = YAML.parseCST(text)
    cst.setOrigRanges() // Workaround for CRLF eol, https://github.com/eemeli/yaml/issues/127
    const doc = new YAML.Document({ keepCstNodes: true }).parse(cst[0])

    const findPairs = (node: YAML.ast.AstNode | YAML.ast.Pair | null, path: string[] = []): KeyInDocument[] => {
      if (!node)
        return []
      if (node.type === 'MAP' || node.type === 'SEQ')
        // @ts-ignore
        return _.flatMap(node.items, m => findPairs(m, path))
      if (node.type === 'PAIR' && node.value != null && node.key != null) {
        console.log('----', path)
        console.log('KEY', node.key, node.value)
        if (!['BLOCK_FOLDED', 'BLOCK_LITERAL', 'PLAIN', 'QUOTE_DOUBLE', 'QUOTE_SINGLE'].includes(node.value.type)) {
          return findPairs(node.value, [...path, node.key.toString()])
        }
        else {
          const valueCST = node.value.cstNode
          if (!valueCST || !valueCST.valueRange)
            return []
          const { start, end, origStart, origEnd } = valueCST.valueRange
          const key = [...path, node.key.toString()].join('.')
          console.log(key)

          return [{
            start: origStart || start,
            end: origEnd || end,
            key,
          }]
        }
      }

      return []
    }

    const keys = findPairs(doc.contents)
    console.log(keys)
    return keys
  }
}
