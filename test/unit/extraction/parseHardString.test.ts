/* eslint-disable no-template-curly-in-string */
import { expect } from 'chai'
import { stringConcatenationToTemplate } from '../../../src/extraction/parseHardString'

describe('parseHardString', () => {
  it('stringContractionToTemplate', () => {
    expect(stringConcatenationToTemplate('\'a\' + b + \'c\'')).to.eql('`a${b}c`')
    expect(stringConcatenationToTemplate('"foo"+bar()')).to.eql('`foo${bar()}`')
    expect(stringConcatenationToTemplate('a + b + c')).to.eql('`${a + b + c}`')
    expect(stringConcatenationToTemplate('a + ` 1 ${d}`+ b + c')).to.eql('`${a} 1 ${d}${b + c}`')
  })
})
