import { regexFindKeys } from '../../tests'
import Framework from '.'

describe('frameworks', () => {
  describe('vue', () => {
    const framework = new Framework()
    const regs = framework.getKeyMatchReg()

    test('$t', () => {
      expect(regexFindKeys('$t("a.b.c")', regs)).toEqual([{ key: 'a.b.c', start: 4, end: 9 }])
    })
    test('$tc', () => {
      expect(regexFindKeys('$tc(\'a.b.c\', 10, { count: 10 })', regs)).toEqual([{ key: 'a.b.c', start: 5, end: 10 }])
    })
    test('$d', () => {
      expect(regexFindKeys('$d(new Date(), "a.b.c")', regs)).toEqual([{ key: 'a.b.c', start: 16, end: 21 }])
    })
    test('$n', () => {
      expect(regexFindKeys('$n(100, \'a.b.c\', \'ja-JP\')', regs)).toEqual([{ key: 'a.b.c', start: 9, end: 14 }])
    })
    test('v-t', () => {
      expect(regexFindKeys('<p v-t="`a.b.c`"/>', regs)).toEqual([{ key: 'a.b.c', start: 9, end: 14 }])
    })
  })
})
