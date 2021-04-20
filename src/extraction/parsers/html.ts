import { Parser } from 'htmlparser2'
import { DefaultDynamicExtractionsRules, DefaultExtractionRules, ExtractionRule } from '../rules'
import { shouldExtract } from '../shouldExtract'
import { ExtractionHTMLOptions } from './options'
import { DetectionResult } from './types'

const defaultOptions: Required<ExtractionHTMLOptions> = {
  attributes: ['title', 'alt', 'placeholder', 'label', 'aria-label'],
  ignoredTags: ['script', 'style'],
  vBind: true,
  inlineText: true,
}

export function detect(
  input: string,
  rules: ExtractionRule[] = DefaultExtractionRules,
  dynamicRules: ExtractionRule[] = DefaultDynamicExtractionsRules,
  userOptions: ExtractionHTMLOptions = {},
) {
  const {
    attributes: ATTRS,
    ignoredTags: IGNORED_TAGS,
    vBind: V_BIND,
  } = Object.assign({}, defaultOptions, userOptions)

  const detections: DetectionResult[] = []

  let lastTag = ''
  const parser = new Parser({
    onopentag(name, attrs) {
      lastTag = name
      if (IGNORED_TAGS.includes(name))
        return

      const attrNames = Object.keys(attrs).map((name) => {
        // static
        if (ATTRS.includes(name) && shouldExtract(attrs[name], rules))
          return [name, false]
        // dynamic
        else if (
          V_BIND
          && ATTRS.some(n => name === `:${n}` || name === `v-bind:${n}`)
          && shouldExtract(attrs[name], dynamicRules)
        )
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
          new RegExp(`\\s${name}=(["'])([^\\1]*?)\\1`, 'm'),
        )
        if (!match)
          continue

        const fullStart = tagStart + match.index! + 1
        const fullEnd = fullStart + match[0].length - 1
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
    ontext(fullText) {
      if (IGNORED_TAGS.includes(lastTag))
        return

      const text = fullText.split(/\n/g).map(i => i.trim()).filter(Boolean).join(' ')

      if (!shouldExtract(text, rules))
        return

      const start = parser.startIndex
      const end = parser.endIndex! + 1

      detections.push({
        text: fullText,
        fullText,
        start,
        end,
        type: 'inline',
      })
    },
  })

  parser.parseComplete(input)

  return detections
}
