import { ExtractionRule, ExtractionScore } from './base'

export class BasicExtrationRule extends ExtractionRule {
  name = 'basic'

  shouldExtract(str: string) {
    if (str.length === 0)
      return ExtractionScore.MustExclude
    // ✅ has a space, and any meaning full letters
    if (str.includes(' ') && str.match(/\w/))
      return ExtractionScore.ShouldInclude
    // ❌ camel case
    if (str.match(/[a-z][A-Z]/))
      return ExtractionScore.ShouldExclude
    // ❌ all digits
    if (str.match(/^[\d.]+$/))
      return ExtractionScore.ShouldExclude
    // ✅ all words
    if (str.match(/^[A-Za-z0-9]+$/))
      return ExtractionScore.ShouldInclude
    // ✅ one char
    if (str.length === 1 && !'/.-\\+$^'.includes(str))
      return ExtractionScore.ShouldInclude
  }
}
