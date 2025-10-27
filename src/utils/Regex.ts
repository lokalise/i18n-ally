import { sortBy } from 'lodash'
import { Config, CurrentFile } from '~/core'
import { isNextIntlScopeRange, NextIntlScopeRange } from '~/frameworks/next-intl'
import i18n from '~/i18n'
import { Log } from '.'
import { KeyInDocument, RewriteKeyContext } from '../core/types'
import { ScopeRange } from '../frameworks/base'
import { QUOTE_SYMBOLS } from '../meta'

export function handleRegexMatch(
  text: string,
  match: RegExpExecArray,
  dotEnding = false,
  rewriteContext?: RewriteKeyContext,
  scopes: ScopeRange[] | NextIntlScopeRange[] = [],
  namespaceDelimiters = [':', '/'],
  defaultNamespace?: string,
  starts: number[] = [],
): KeyInDocument | undefined {
  const matchString = match[0]

  let keyIndex = 1
  let nextIntlFunctionName: string | undefined
  const hasNextIntlScope = scopes.some(s => isNextIntlScopeRange(s))
  // Switch to NextIntl capture layout when the regex actually provided both groups
  if (hasNextIntlScope && typeof match[2] !== 'undefined') {
    keyIndex = 2
    nextIntlFunctionName = match[1] as string
  }
  let key = match[keyIndex]
  if (!key)
    return

  const start = match.index + matchString.lastIndexOf(key)
  const end = start + key.length
  const scope = scopes.find(s => s.start <= start && s.end >= end && (!isNextIntlScopeRange(s) || s.functionName === nextIntlFunctionName))
  const quoted = QUOTE_SYMBOLS.includes(text[start - 1])

  const namespace = scope?.namespace || defaultNamespace

  // prevent duplicated detection when multiple frameworks enables at the same time.
  if (starts.includes(start))
    return

  starts.push(start)

  // prefix the namespace
  const hasExplicitNamespace = namespaceDelimiters.some(delimiter => key.includes(delimiter))

  if (!hasExplicitNamespace && namespace)
    key = `${namespace}.${key}`

  if (dotEnding || !key.endsWith('.')) {
    key = CurrentFile.loader.rewriteKeys(key, 'reference', {
      ...rewriteContext,
      namespace,
    })
    return {
      key,
      start,
      end,
      quoted,
    }
  }
}

export function regexFindKeys(
  text: string,
  regs: RegExp[],
  dotEnding = false,
  rewriteContext?: RewriteKeyContext,
  scopes: ScopeRange[] = [],
  namespaceDelimiters?: string[],
): KeyInDocument[] {
  if (Config.disablePathParsing)
    dotEnding = true

  const defaultNamespace = Config.defaultNamespace
  const keys: KeyInDocument[] = []
  const starts: number[] = []

  for (const reg of regs) {
    let match = null
    reg.lastIndex = 0
    // eslint-disable-next-line no-cond-assign
    while (match = reg.exec(text)) {
      const key = handleRegexMatch(text, match, dotEnding, rewriteContext, scopes, namespaceDelimiters, defaultNamespace, starts)
      if (key)
        keys.push(key)
    }
  }

  return sortBy(keys, i => i.start)
}

export function normalizeUsageMatchRegex(reg: (string | RegExp)[]): RegExp[] {
  return reg.map((i) => {
    if (typeof i === 'string') {
      try {
        const interpated = i.replace(/{key}/g, Config.regexKey)
        return new RegExp(interpated, 'gm')
      }
      catch (e) {
        Log.error(i18n.t('prompt.error_on_parse_custom_regex', i), true)
        Log.error(e, false)
        return undefined
      }
    }
    return i
  })
    .filter(i => i) as RegExp[]
}
