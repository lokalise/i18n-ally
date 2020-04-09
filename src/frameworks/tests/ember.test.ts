import { forRegex } from '../../tests/utils'
import Framework from '../ember'

describe('regex', () => {
  const framework = new Framework()
  const regs = forRegex(framework.getKeyMatchReg())

  test('{{ t }}', () => {
    expect(regs.getFirstKey('{{t \'a.b.c\' numPhotos=model.photos.length}}')).toEqual('a.b.c')
  })

  test('intl.t', () => {
    expect(regs.getFirstKey('this.intl.t(\'a.b.c\')')).toEqual('a.b.c')
  })
})
