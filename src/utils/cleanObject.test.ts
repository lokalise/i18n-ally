import { cleanObject } from './cleanObject'

describe('utils', () => {
  describe('cleanObject', () => {
    it('basic', () => {
      expect(cleanObject({
        a: {
          b:
           {
             c: 1,
             d: false,
           },
          e: [],
          z: {},
          x: { y: undefined },
        },
        c: [false, {}],
        d: [[], { d: [] }],
        e: [[], { d: [0] }],
      })).toEqual({
        a: {
          b:
           {
             c: 1,
             d: false,
           },
        },
        c: [false],
        e: [{ d: [0] }],
      })
    })
  })
})
