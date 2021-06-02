import { parse } from '@babel/parser'
// @ts-ignore
import traverse from '@babel/traverse'
import { DefaultDynamicExtractionsRules, DefaultExtractionRules, ExtractionRule } from '../rules'
import { shouldExtract } from '../shouldExtract'
import { DetectionResult } from '~/core/types'

export function detect(
  input: string,
  rules: ExtractionRule[] = DefaultExtractionRules,
  dynamicRules: ExtractionRule[] = DefaultDynamicExtractionsRules,
) {
  const detections: DetectionResult[] = []

  const ast = parse(input, {
    sourceType: 'unambiguous',
    plugins: [
      'jsx',
      'typescript',
      'decorators-legacy',
    ],
  })

  function handlePath(path: any, type: DetectionResult['source']) {
    if (!path.node.start || !path.node.end)
      return

    const quoted = type !== 'jsx-text'

    const fullStart = path.node.start
    const fullEnd = path.node.end
    const fullText = input.slice(fullStart, fullEnd)

    // const start = quoted ? fullStart + 1 : fullStart
    // const end = quoted ? fullEnd - 1 : fullEnd
    const text = quoted ? fullText.slice(1, -1) : fullText

    if (type === 'js-template' && !shouldExtract(text, dynamicRules))
      return
    else if (!shouldExtract(text, rules))
      return

    detections.push({
      fullEnd,
      fullStart,
      fullText,
      start: fullStart,
      end: fullEnd,
      text,
      source: type,
    })
  }

  traverse(ast, {
    StringLiteral(path: any) {
      handlePath(path, 'js-string')
    },
    TemplateLiteral(path: any) {
      handlePath(path, 'js-template')
    },
    JSXText(path: any) {
      handlePath(path, 'jsx-text')
    },
  })

  return detections
}
