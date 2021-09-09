import { ExtractionRule, ExtractionScore } from './base'

export class NonAsciiExtractionRule extends ExtractionRule {
  name = 'non-ascii-characters'

  shouldExtract(str: string) {
    // [^\u{0}-\u{7F}] -- non Latin script,see https://unicode.org/reports/tr18/#General_Category_Property
    const words = str.match(/\p{Letter}*/ug) ?? []
    const wordsWithNonAsciiChars = words.filter(word => word.match(/[^\u{0}-\u{7F}]/u))

    if (wordsWithNonAsciiChars.length > 0)
      return ExtractionScore.MustInclude
  }
}
