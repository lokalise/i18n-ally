import { ExtractionRule, ExtractionScore } from './base'

export class NonAsciiExtractionRule extends ExtractionRule {
  name = 'non-ascii-characters'

  shouldExtract(str: string) {
    // [^\u{0}-\u{7F}] -- non Latin script,see https://unicode.org/reports/tr18/#General_Category_Property
    const words = str.match(/\p{Letter}*/ug) ?? []
    const containsWordWithNonAsciiChar = words.some(word => word.match(/[^\u{0}-\u{7F}]/u))

    if (containsWordWithNonAsciiChar)
      return ExtractionScore.MustInclude
  }
}
