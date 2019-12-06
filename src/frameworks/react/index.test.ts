import { forRegex } from '../../tests/utils'
import Framework from '.'

describe('regex', () => {
  const framework = new Framework()
  const regs = forRegex(framework.getKeyMatchReg())

  test('$t', () => {
    expect(regs.getFirstKey('$t("a.b.c")')).toEqual('a.b.c')
  })

  test('t-ending functions', () => {
    expect(regs.getFirstKey('split("a.b.c")')).toEqual(undefined)
    expect(regs.getFirstKey('f1t("a.b.c")')).toEqual(undefined)
  })

  // TODO: add more
})
