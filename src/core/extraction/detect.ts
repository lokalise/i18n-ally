import { ExtractionRule, ExtractionScore } from './rules'

export function shouldExtract(str: string, rules: ExtractionRule[]): boolean {
  let extract = false
  for (const rule of rules) {
    const result = rule.shouldExtract(str)
    if (result === ExtractionScore.MustExclude)
      return false
    if (result === ExtractionScore.MustInclude)
      return true
    if (result === ExtractionScore.ShouldExclude)
      extract = false
    if (result === ExtractionScore.ShouldInclude)
      extract = true
  }
  return extract
}
