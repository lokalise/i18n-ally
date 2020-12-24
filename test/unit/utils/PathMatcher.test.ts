import { expect } from 'chai'
import { ParsePathMatcher, ReplaceLocale } from '../../../src/utils/PathMatcher'

describe('PathMatching', () => {
  const cases = [
    ['{namespace}/**/{locale}.json', 'moduleC/nested/locales/zh-cn.json', 'moduleC', 'zh-cn'],
    ['{namespaces}/{locale}.json', 'modules/nested/en.json', 'modules/nested', 'en'],
    ['{namespaces}/{locale}.json', 'modules/nested/en.js', null],
    ['{namespaces}/{locale}.(json|yml)', 'modules/nested/en.yml', 'modules/nested', 'en'],
    ['{namespace}/{locale}.*', 'nested/en.whatever', 'nested', 'en'],
    ['{namespaces?}/{locale}.*', 'nested/en.whatever', 'nested', 'en'],
    ['{namespaces?}/?{locale}.*', 'en.whatever', '', 'en'],
    ['{locale}/{namespaces}.*', 'zh-cn/hello/world/messages.json', 'hello/world/messages', 'zh-cn'],
    ['{locale}/modules/{namespaces}.*', 'jp/modules/hello/world.json', 'hello/world', 'jp'],
    ['{locale}/modules/*.*', 'jp/modules/a.json', undefined, 'jp'],
    ['{locale}/modules/*.js', 'jp/modules/a.js', undefined, 'jp'],
    ['**/{locale}.json', 'fr.json', undefined, 'fr'],
    ['hello/**/{locale}.json', 'hello/fr.json', undefined, 'fr'],
    ['nls.?{locale?}.json', 'nls.json', undefined, ''],
  ] as const

  for (const [map, path, expectedNamespace, expectedLocale] of cases) {
    it(map, () => {
      const re = ParsePathMatcher(map)
      const result = re.exec(path)

      if (!result) {
        expect(expectedNamespace).to.eql(null)
      }
      else {
        expect(result.groups?.namespace).to.eql(expectedNamespace)
        expect(result.groups?.locale).to.eql(expectedLocale)
      }
    })
  }
})

describe('ReplaceLocale', () => {
  const cases = [
    ['en/nested/en.json', '{namespaces}/{locale}.json', 'zh', 'en/nested/zh.json'],
    ['en/zh/fr/en.json', 'en/zh/{locale}/{namespace}.json', 'fr', 'en/zh/fr/en.json'],
  ] as const

  for (const c of cases) {
    it(c[0], () => {
      const args = c.slice(0, -1)
      const result = c[c.length - 1]
      expect(
        // @ts-ignore
        ReplaceLocale(...args),
      ).to.eql(result)
    })
  }
})
