import { parse } from '@babel/parser'
// @ts-ignore
import traverse from '@babel/traverse'
import { DefaultDynamicExtractionsRules, DefaultExtractionRules, ExtractionRule } from '../rules'
import { shouldExtract } from '../shouldExtract'
import { ExtractionBabelOptions } from './options'
import { DetectionResult } from '~/core/types'

const defaultOptions: Required<ExtractionBabelOptions> = {
  ignoredJSXAttributes: ['class', 'className', 'key', 'style', 'ref', 'onClick'],
}

export function detect(
  input: string,
  rules: ExtractionRule[] = DefaultExtractionRules,
  dynamicRules: ExtractionRule[] = DefaultDynamicExtractionsRules,
  userOptions: ExtractionBabelOptions = {},
) {
  const {
    ignoredJSXAttributes,
  } = Object.assign({}, defaultOptions, userOptions)

  const detections: DetectionResult[] = []

  const ast = parse(input, {
    sourceType: 'unambiguous',
    plugins: [
      'jsx',
      'typescript',
      'decorators-legacy',
    ],
  })

  const ignores: [number, number][] = []

  function handlePath(path: any, type: DetectionResult['source']) {
    const fullStart = path?.node?.start
    const fullEnd = path?.node?.end

    if (!fullStart || !fullEnd)
      return

    if (isIgnored(fullStart, fullEnd))
      return

    const quoted = type !== 'jsx-text'
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

  function recordIgnore(path: any) {
    const fullStart = path?.node?.start ?? path?.start
    const fullEnd = path?.node?.end ?? path?.end

    if (!fullStart || !fullEnd)
      return

    ignores.push([fullStart, fullEnd])
  }

  function isIgnored(start: number, end: number) {
    return ignores.find(([s, e]) => (s <= start && start <= e) || (s <= end && end <= e)) != null
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
    // scan for jsx attributes
    JSXElement(path: any) {
      path?.node?.openingElement?.attributes?.forEach((i: any) => {
        if (ignoredJSXAttributes.includes(i?.name?.name))
          recordIgnore(i)
      })
    },
    // ignore `console.xxx`
    CallExpression(path: any) {
      const callee = path.get('callee')
      if (!callee.isMemberExpression()) return
      if (isGlobalConsoleId(callee.get('object')))
        recordIgnore(path)
    },
  })

  return detections
}

function isGlobalConsoleId(id: any) {
  const name = 'console'
  return (
    id.isIdentifier({ name })
    && !id.scope.getBinding(name)
    && id.scope.hasGlobal(name)
  )
}
