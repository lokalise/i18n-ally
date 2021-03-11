import { Parser } from 'htmlparser2'
import { ExtractionRule } from '../rules'
import { shouldExtract } from '../shouldExtract'
import { ExtractionHTMLOptions } from './options'

export interface DetectionResult {
  text: string
  start: number
  end: number
  isDynamic?: boolean
  fullText?: string
  fullStart?: number
  fullEnd?: number
  type: 'attribute' | 'inline'
}

const defaultOptions: Required<ExtractionHTMLOptions> = {
  attributes: ['title', 'alt', 'placeholder', 'label', 'aria-label'],
  vBind: true,
  inlineText: true,
}

export function detect(
  input: string,
  rules?: ExtractionRule[],
  userOptions: ExtractionHTMLOptions = {},
) {
  const {
    attributes: ATTRS,
    vBind: V_BIND,
  } = Object.assign({}, defaultOptions, userOptions)

  const detections: DetectionResult[] = []

  const parser = new Parser({
    onopentag(_, attrs) {
      const attrNames = Object.keys(attrs).map((name) => {
        // static
        if (ATTRS.includes(name) && shouldExtract(attrs[name], rules))
          return [name, false]
        // dynamic
        else if (V_BIND && ATTRS.some(n => name === `:${n}` || name === `v-bind:${n}`))
          return [name, true]
        return null
      })
        .filter(Boolean) as [string, boolean][]
      if (!attrNames.length)
        return

      const tagStart = parser.startIndex
      const tagEnd = parser.endIndex!
      const code = input.slice(tagStart, tagEnd)

      for (const [name, isDynamic] of attrNames) {
        const match = code.match(
          new RegExp(`\\b${name}=(["'])(.*?)\\1`, 'm'),
        )
        if (!match)
          continue

        const fullStart = tagStart + match.index!
        const fullEnd = fullStart + match[0].length
        const fullText = input.slice(fullStart, fullEnd)
        const start = fullStart + name.length + 2 // ="
        const end = fullEnd - 1 // "
        const text = input.slice(start, end)

        detections.push({
          text,
          start,
          end,
          isDynamic,
          fullStart,
          fullEnd,
          fullText,
          type: 'attribute',
        })
      }
    },
    ontext(text) {
      const tagStart = parser.startIndex
      const tagEnd = parser.endIndex!

      text = text.split(/\n/g).map(i => i.trim()).filter(Boolean).join(' ')

      if (!shouldExtract(text, rules))
        return

      detections.push({
        text,
        start: tagStart,
        end: tagEnd,
        type: 'inline',
      })
    },
  })

  parser.parseComplete(input)

  return detections
}
