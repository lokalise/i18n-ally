import { regexFindKeys } from '../../tests'
import Framework from '.'

describe('regex', () => {
  const framework = new Framework()
  const regs = framework.getKeyMatchReg()

  test('$t', () => {
    expect(regexFindKeys('$t("a.b.c")', regs)[0].key).toEqual('a.b.c')
  })

  test('t-ending functions', () => {
    expect(regexFindKeys('split("a.b.c")', regs)).toEqual([])
    expect(regexFindKeys('f1t("a.b.c")', regs)).toEqual([])
  })

  // TODO: add more
})
