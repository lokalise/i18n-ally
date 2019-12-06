import { forRegex } from '../../tests/utils'
import Framework from '.'

describe('regex', () => {
  const framework = new Framework()
  const regs = forRegex(framework.getKeyMatchReg())

  test('$t', () => {
    expect(regs.getKeysInfo('$t("a.b.c")')).toEqual([{ key: 'a.b.c', start: 4, end: 9 }])
  })
  test('$tc', () => {
    expect(regs.getKeysInfo('$tc(\'a.b.c\', 10, { count: 10 })')).toEqual([{ key: 'a.b.c', start: 5, end: 10 }])
  })
  test('$d', () => {
    expect(regs.getKeysInfo('$d(new Date(), "a.b.c")')).toEqual([{ key: 'a.b.c', start: 16, end: 21 }])
  })
  test('$n', () => {
    expect(regs.getKeysInfo('$n(100, \'a.b.c\', \'ja-JP\')')).toEqual([{ key: 'a.b.c', start: 9, end: 14 }])
  })
  test('v-t', () => {
    expect(regs.getKeysInfo('<p v-t="`a.b.c`"/>')).toEqual([{ key: 'a.b.c', start: 9, end: 14 }])
  })

  // TODO: add more
})
