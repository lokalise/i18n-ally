import { ExtractionRule, ExtractionScore } from './base'

export class BasicExtrationRule extends ExtractionRule {
  name = 'basic'

  shouldExtract(str: string) {
    const s = str.replace(/\$\{.*?\}/g, '').trim()

    if (s.length === 0)
      return ExtractionScore.MustExclude
    // ❌ brackets
    if (s.match(/^{.*}$/))
      return ExtractionScore.MustExclude
    // ✅ has a space, and any meaning full letters
    if (s.includes(' ') && s.match(/\w/))
      return ExtractionScore.ShouldInclude
    // ❌ camel case
    if (s.match(/[a-z][A-Z0-9]/))
      return ExtractionScore.ShouldExclude
    // ❌ all lower cases
    if (s.match(/^[a-z0-9-]+$/))
      return ExtractionScore.ShouldExclude
    // ❌ all upper cases
    if (s.match(/^[A-Z0-9-]+$/))
      return ExtractionScore.ShouldExclude
    // ❌ all digits
    if (s.match(/^[\d.]+$/))
      return ExtractionScore.ShouldExclude
    // ✅ all words
    if (s.match(/^[A-Za-z0-9]+$/))
      return ExtractionScore.ShouldInclude
    // ✅ one char
    if (s.length === 1 && !'/.-\\:+$^#_"\','.includes(s))
      return ExtractionScore.ShouldInclude
  }
}
