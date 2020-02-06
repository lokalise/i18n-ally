/* eslint-disable no-dupe-keys */
import { flatten, ROOT_KEY, unflatten } from './flat'

describe('utils', () => {
  describe('flatten', () => {
    it('basic', () => {
      expect(flatten({
        a: { b: { c: 1 } },
      })).toEqual({
        'a.b.c': 1,
      })
    })

    it('root', () => {
      expect(flatten({
        [ROOT_KEY]: 2,
        a: { b: { c: 1, [ROOT_KEY]: 3 } },
      })).toEqual({
        '': 2,
        'a.b': 3,
        'a.b.c': 1,
      })
    })
  })

  describe('unflatten', () => {
    it('basic', () => {
      expect(unflatten({
        'a.b.c': 1,
        'a.b.d': 2,
      })).toEqual({
        a: {
          b: {
            c: 1,
            d: 2,
          },
        },
      })
    })

    it('root', () => {
      expect(unflatten({
        '': 2,
        'a.b': 3,
        'a.b.c': 1,
      })).toEqual({
        [ROOT_KEY]: 2,
        a: { b: { c: 1, [ROOT_KEY]: 3 } },
      })
    })
  })
})
