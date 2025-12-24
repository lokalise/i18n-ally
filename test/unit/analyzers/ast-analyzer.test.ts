import { expect } from 'chai'
import { analyzeUseTranslations, analyzeTranslationUsages } from '../../../src/analyzers/ast-analyzer'

describe('AST Analyzer', () => {
  describe('analyzeUseTranslations', () => {
    it('should detect string literal namespace', () => {
      const code = `const t = useTranslations('auth');`
      const results = analyzeUseTranslations(code)

      expect(results).to.have.length(1)
      expect(results[0].variableName).to.equal('t')
      expect(results[0].namespace).to.equal('auth')
      expect(results[0].isDynamic).to.be.false
    })

    it('should detect variable namespace with constant propagation', () => {
      const code = `
        const ns = 'auth';
        const t = useTranslations(ns);
      `
      const results = analyzeUseTranslations(code)

      expect(results).to.have.length(1)
      expect(results[0].variableName).to.equal('t')
      expect(results[0].namespace).to.equal('auth')
      expect(results[0].isDynamic).to.be.false
    })

    it('should detect dynamic expression namespace', () => {
      const code = `const t = useTranslations(getNamespace());`
      const results = analyzeUseTranslations(code)

      expect(results).to.have.length(1)
      expect(results[0].variableName).to.equal('t')
      expect(results[0].namespace).to.be.null
      expect(results[0].isDynamic).to.be.true
      expect(results[0].dynamicPlaceholder).to.include('<dynamic:unknown:L1>')
    })

    it('should detect static template literal namespace', () => {
      const code = 'const t = useTranslations(`auth`);'
      const results = analyzeUseTranslations(code)

      expect(results).to.have.length(1)
      expect(results[0].namespace).to.equal('auth')
    })

    it('should detect dynamic template literal via constant propagation', () => {
      const code = `
        const prefix = 'auth';
        const t = useTranslations(\`\${prefix}.page\`);
      `
      const results = analyzeUseTranslations(code)

      expect(results).to.have.length(1)
      expect(results[0].namespace).to.equal('auth.page')
      expect(results[0].isDynamic).to.be.false
    })

    it('should fail resolution for truly dynamic template literal', () => {
      const code = `
        const t = useTranslations(\`\${someVar}.page\`);
      `
      const results = analyzeUseTranslations(code)

      expect(results).to.have.length(1)
      expect(results[0].isDynamic).to.be.true
      expect(results[0].namespace).to.be.null
    })

    it('should handle multiple useTranslations calls', () => {
      const code = `
        const t = useTranslations('auth');
        const common = useTranslations('common');
      `
      const results = analyzeUseTranslations(code)

      expect(results).to.have.length(2)
      expect(results[0].variableName).to.equal('t')
      expect(results[0].namespace).to.equal('auth')
      expect(results[1].variableName).to.equal('common')
      expect(results[1].namespace).to.equal('common')
    })

    it('should handle await getTranslations', () => {
      const code = `const t = await getTranslations('auth');`
      const results = analyzeUseTranslations(code)

      expect(results).to.have.length(1)
      expect(results[0].variableName).to.equal('t')
      expect(results[0].namespace).to.equal('auth')
    })

    it('should handle no-argument calls (dynamic default)', () => {
      const code = `const t = useTranslations();`
      const results = analyzeUseTranslations(code)

      expect(results).to.have.length(1)
      expect(results[0].isDynamic).to.be.true
      expect(results[0].dynamicPlaceholder).to.include('<no-namespace:unknown:L1>')
    })
  })

  describe('analyzeTranslationUsages', () => {
    it('should find t() calls with string literal keys and apply namespace', () => {
      const code = `
        const t = useTranslations('auth');
        const title = t('login.title');
        const desc = t('login.description');
      `
      // Simulate providing map derived from analyzeUseTranslations
      const results = analyzeTranslationUsages(code, new Map([['t', 'auth']]))

      expect(results).to.have.length(2)
      expect(results[0].variableName).to.equal('t')
      expect(results[0].key).to.equal('auth.login.title')
      expect(results[1].key).to.equal('auth.login.description')
      expect(results[0].quoted).to.be.true
    })

    it('should find t.rich() calls', () => {
      const code = `const message = t.rich('welcome', { name: 'John' });`
      const results = analyzeTranslationUsages(code, new Map([['t', 'common']]))

      expect(results).to.have.length(1)
      expect(results[0].variableName).to.equal('t')
      expect(results[0].key).to.equal('common.welcome')
    })

    it('should find multiple variable usages with correct namespaces', () => {
      const code = `
        const title = t('title');
        const commonLabel = common('label');
      `
      const results = analyzeTranslationUsages(code, new Map([
        ['t', 'auth'],
        ['common', 'common']
      ]))

      expect(results).to.have.length(2)
      expect(results[0].variableName).to.equal('t')
      expect(results[0].key).to.equal('auth.title')
      expect(results[1].variableName).to.equal('common')
      expect(results[1].key).to.equal('common.label')
    })

    it('should handle template literal keys (static)', () => {
      const code = 'const message = t(`static.key`);'
      const results = analyzeTranslationUsages(code, new Map([['t', 'common']]))

      expect(results).to.have.length(1)
      expect(results[0].key).to.equal('common.static.key')
      expect(results[0].quoted).to.be.true
    })

    // NEW: Key Constant Propagation Tests

    it('should resolve key from variable with constant propagation', () => {
      const code = `
        const key = 'login.title';
        t(key);
      `
      const results = analyzeTranslationUsages(code, new Map([['t', 'auth']]))

      expect(results).to.have.length(1)
      expect(results[0].key).to.equal('auth.login.title')
      expect(results[0].quoted).to.be.false
      expect(results[0].variableName).to.equal('t')
    })

    it('should NOT return key if variable is dynamic/unknown', () => {
      const code = `
        t(someUnknownVar);
      `
      const results = analyzeTranslationUsages(code, new Map([['t', 'auth']]))

      expect(results).to.have.length(0)
    })

    it('should resolve key from static template literal variable', () => {
      const code = `
        const key = \`login.title\`;
        t(key);
      `
      const results = analyzeTranslationUsages(code, new Map([['t', 'auth']]))

      expect(results).to.have.length(1)
      expect(results[0].key).to.equal('auth.login.title')
      expect(results[0].quoted).to.be.false // Indirect key usage (variable) is not quoted in usage
    })

    it('should handle null namespace (e.g. dynamic namespace)', () => {
      const code = `t('title');`
      // Map has t but no namespace (null mapping or not present?)
      // If namespace is dynamic, it might be mapped to a placeholder or not mapped.
      // analyzeTranslationUsages expects string | undefined for namespace.
      // If we pass undefined (or empty string/null), it uses key as is.
      const results = analyzeTranslationUsages(code, new Map([['t', '']]))

      // If namespace is empty, just returns key
      expect(results).to.have.length(1)
      expect(results[0].key).to.equal('title')
    })
    it('should resolve keys from array map iteration', () => {
      const code = `
        const CATEGORIES = ['electronics', 'books'];
        CATEGORIES.map(cat => t(cat));
      `
      const results = analyzeTranslationUsages(code, new Map([['t', 'common']]))

      expect(results).to.have.length(2)
      expect(results[0].key).to.equal('common.electronics')
      expect(results[1].key).to.equal('common.books')
    })
    it('should resolve keys from imported constant array', () => {
      const code = `
        import { CATEGORIES } from './constants';
        CATEGORIES.map(cat => t(cat));
      `
      const importer = (path: string) => {
        if (path === './constants') {
          return "export const CATEGORIES = ['electronics', 'books'];"
        }
        return undefined
      }

      const results = analyzeTranslationUsages(code, new Map([['t', 'common']]), importer)

      expect(results).to.have.length(2)
      expect(results[0].key).to.equal('common.electronics')
      expect(results[1].key).to.equal('common.books')
    })

    it('should resolve keys from array with as const assertion', () => {
      const code = `
        const CATEGORIES = ['a', 'b'] as const;
        CATEGORIES.map(cat => t(cat));
      `
      const results = analyzeTranslationUsages(code, new Map([['t', 'common']]))

      expect(results).to.have.length(2)
      expect(results[0].key).to.equal('common.a')
      expect(results[1].key).to.equal('common.b')
    })
    
    it('should respect correct scope for multiple t variables', () => {
      const code = `
        function A() {
           const t = useTranslations('ns1');
           t('key1');
        }
        function B() {
           const t = useTranslations('ns2');
           t('key2');
        }
      `
      // Simulate detectKeys behavior where loop overwrites 't' to 'ns2'
      const results = analyzeTranslationUsages(code, new Map([['t', 'ns2']]))

      expect(results).to.have.length(2)
      expect(results[0].key).to.equal('ns1.key1')
      expect(results[1].key).to.equal('ns2.key2')
    })

    it('should resolve keys from object array map iteration', () => {
      const code = `
        const SECTIONS = [
            { id: 'section-basic', label: 'nav.basic' },
            { id: 'section-groupbuy', label: 'nav.group_buy' },
        ];
        SECTIONS.map((section) => t(section.label));
      `
      const results = analyzeTranslationUsages(code, new Map([['t', 'common']]))
      
      expect(results).to.have.length(2)
      expect(results[0].key).to.equal('common.nav.basic')
      expect(results[1].key).to.equal('common.nav.group_buy')
    })
    it('should respect variable shadowing for constants', () => {
      const code = `
        const ns = 'global';
        function A() {
           const t = useTranslations(ns);
        }
        function B() {
           const ns = 'local';
           const t = useTranslations(ns);
        }
      `
      const results = analyzeUseTranslations(code)
      
      expect(results).to.have.length(2)
      // The order depends on traversal, but checking values is key
      const resultA = results.find(r => r.location.line === 4)
      const resultB = results.find(r => r.location.line === 8)

      expect(resultA?.namespace).to.equal('global')
      expect(resultB?.namespace).to.equal('local')
    })

    it('should respect variable shadowing for keys', () => {
      const code = `
        const key = 'global.key';
        function A() {
           t(key);
        }
        function B() {
           const key = 'local.key';
           t(key);
        }
      `
      const results = analyzeTranslationUsages(code, new Map([['t', 'common']]))
      
      const resultA = results.find(r => r.key.endsWith('global.key'))
      const resultB = results.find(r => r.key.endsWith('local.key'))

      // If flat map is used, one might overwrite the other or both become same
      expect(resultA).to.exist
      expect(resultA?.key).to.equal('common.global.key')
      
      expect(resultB).to.exist
      expect(resultB?.key).to.equal('common.local.key')
    })
  })
})
