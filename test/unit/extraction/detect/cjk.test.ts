import { expect } from 'chai'
import { BasicExtrationRule, CJKExtrationRule, shouldExtract } from '../../../../src/core/extraction'

const rules = [
  new BasicExtrationRule(),
  new CJKExtrationRule(),
]

const includes = [
  '你好',
  'こんにちは',
  '안녕하십니까',
  '再見',
  '再见',
]

const excludes = [
  '',
]

describe('extraction-cjk', () => {
  it('should includes', () => {
    const excluded = includes.filter(str => !shouldExtract(str, rules))
    expect(excluded).eql([])
  })

  it('should exclude', () => {
    const included = excludes.filter(str => shouldExtract(str, rules))
    expect(included).eql([])
  })
})
