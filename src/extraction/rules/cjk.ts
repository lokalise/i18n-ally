import { ExtractionRule, ExtractionScore } from './base'

export class CJKExtrationRule extends ExtractionRule {
  name = 'cjk'

  shouldExtract(str: string) {
    // Chinese
    if (str.match(/\p{Script=Han}/u))
      return ExtractionScore.MustInclude
    // Japanese
    if (str.match(/[\p{Script=Katakana}\p{Script=Hiragana}]/u))
      return ExtractionScore.MustInclude
    // Korean
    if (str.match(/\p{Script=Hangul}/u))
      return ExtractionScore.MustInclude
  }
}
