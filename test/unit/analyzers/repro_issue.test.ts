
import { expect } from 'chai'
import { analyzeUseTranslations, analyzeTranslationUsages } from '../../../src/analyzers/ast-analyzer'

describe('AST Analyzer Reproduction Tests', () => {
    it('should resolve indirect template literal namespace', () => {
        const code = `
            const part = 'auth';
            const ns = \`scope.\${part}\`;
            const t = useTranslations(ns);
        `
        const results = analyzeUseTranslations(code)
        expect(results).to.have.length(1)
        expect(results[0].namespace).to.equal('scope.auth')
    })
    
    it('should resolve binary expression concatenation usage', () => {
        const code = `
            const ns = 'scope' + '.sub';
            const t = useTranslations(ns);
        `
        const results = analyzeUseTranslations(code)
        expect(results).to.have.length(1)
        expect(results[0].namespace).to.equal('scope.sub')
    })

    it('should resolve object variable in array map', () => {
        const code = `
            const ITEMS = [{ id: 'item1' }, { id: 'item2' }];
            ITEMS.map(i => t(i.id));
        `
        const results = analyzeTranslationUsages(code, new Map([['t', 'common']]))
        expect(results).to.have.length(2)
        expect(results[0].key).to.equal('common.item1')
        expect(results[1].key).to.equal('common.item2')
    })
    
    it('should resolve namespace with "as const" assertion', () => {
        const code = `const t = useTranslations('auth' as const);`
        const results = analyzeUseTranslations(code)
        
        expect(results).to.have.length(1)
        expect(results[0].namespace).to.equal('auth')
    })

    it('should resolve key with "as const" assertion', () => {
        const code = `t('login.title' as const);`
        const results = analyzeTranslationUsages(code, new Map([['t', 'auth']]))
        
        expect(results).to.have.length(1)
        expect(results[0].key).to.equal('auth.login.title')
    })
})
