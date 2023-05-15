import { parse } from '@babel/parser'
// @ts-ignore
import traverse from '@babel/traverse'
import { TextDocument } from 'vscode'
import { Framework, ScopeRange } from './base'
import { LanguageId } from '~/utils'
import { RewriteKeySource, RewriteKeyContext, DirStructure, KeyStyle } from '~/core'

class ShopifyI18nextFramework extends Framework {
  id = 'i18next-shopify'
  display = 'Shopify I18next'
  namespaceDelimiter = ':'

  perferredKeystyle?: KeyStyle = 'nested'
  perferredDirStructure?: DirStructure = 'file'

  // both `/` and `:` should work as delimiter, #425
  namespaceDelimiters = [':', '/']
  namespaceDelimitersRegex = /[:/]/g

  detection = {
    packageJSON: [
      'react-i18next',
      'next-i18next',
    ],
  }

  languageIds: LanguageId[] = [
    'javascript',
    'typescript',
    'javascriptreact',
    'typescriptreact',
    'ejs',
  ]

  // for visualize the regex, you can use https://regexper.com/
  usageMatchRegex = [
    '\\Wt\\(\\s*[\'"`]({key})[\'"`]',
    '\\Wi18nKey=[\'"`]({key})[\'"`]',
  ]

  derivedKeyRules = [
    '{key}.plural',
    '{key}.0',
    '{key}.1',
    '{key}.2',
    '{key}.3',
    '{key}.4',
    '{key}.5',
    '{key}.6',
    '{key}.7',
    '{key}.8',
    '{key}.9',
    // support v4 format as well as v3
    '{key}.zero',
    '{key}.one',
    '{key}.two',
    '{key}.few',
    '{key}.many',
    '{key}.other',
  ]

  refactorTemplates(keypath: string) {
    return [
      `{t('${keypath}')}`,
      `t('${keypath}')`,
      `<Trans i18nKey="${keypath}"></Trans>`,
      keypath,
    ]
  }

  rewriteKeys(key: string, source: RewriteKeySource, context: RewriteKeyContext = {}) {
    const dottedKey = key.split(this.namespaceDelimitersRegex).join('.')

    // when explicitly set the namespace, ignore current namespace scope
    if (
      this.namespaceDelimiters.some(d => key.includes(d))
      && context.namespace
      && dottedKey.startsWith(context.namespace.split(this.namespaceDelimitersRegex).join('.'))
    )
      // +1 for the an extra `.`
      key = key.slice(context.namespace.length + 1)

    // replace colons
    return dottedKey
  }

  // useTranslation
  // https://react.i18next.com/latest/usetranslation-hook#loading-namespaces
  getScopeRange(document: TextDocument): ScopeRange[] | undefined {
    if (!this.languageIds.includes(document.languageId as any))
      return

    const ranges: ScopeRange[] = []
    const text = document.getText()

    const ast = parse(text)

    const detections = []
    traverse(ast, {
      JSXText(path: any) {
        detections.push(path)
      },
    })

    // Add smaller local scope overrides first
    // Namespaced prefixed keys already handled by rewriteKeys

    // t('foo', { ns: 'ns1' })
    const regT = /\Wt\([^)]*?ns:\s*['"`](\w+)['"`]/g

    for (const match of text.matchAll(regT)) {
      if (typeof match.index !== 'number')
        continue

      if (match[1]) {
        ranges.push({
          start: match.index,
          end: match.index + match[0].length,
          namespace: match[1],
        })
      }
    }

    // <Trans i18nKey="foo" ns="ns1" />
    const regTrans = /\Wi18nKey=(?:(?!\/Trans>|\/>)[\S\s])*?ns=\s*['"`](.+?)['"`]/g

    for (const match of text.matchAll(regTrans)) {
      if (typeof match.index !== 'number')
        continue

      if (match[1]) {
        ranges.push({
          start: match.index,
          end: match.index + match[0].length,
          namespace: match[1],
        })
      }
    }

    // Add first namespace as a global scope resetting on each occurrence
    // useTranslation(ns1) and useTranslation(['ns1', ...])
    const regUse = /useTranslation\(\s*\[?\s*['"`](.*?)['"`]/g
    let prevGlobalScope = false
    for (const match of text.matchAll(regUse)) {
      if (typeof match.index !== 'number')
        continue

      // end previous scope
      if (prevGlobalScope)
        ranges[ranges.length - 1].end = match.index

      // start a new scope if namespace is provided
      if (match[1]) {
        prevGlobalScope = true
        ranges.push({
          start: match.index,
          end: text.length,
          namespace: match[1],
        })
      }
    }

    return ranges
  }
}

export default ShopifyI18nextFramework
