import { sortBy } from 'lodash'
import { CurrentFile, Config } from '../core'
import { KeyInDocument, RewriteKeyContext } from '../core/types'
import i18n from '../i18n'
import { ScopeRange } from '../frameworks/base'
import { Log } from '.'

export function regexFindKeys(text: string, regs: RegExp[], dotEnding = false, rewriteContext?: RewriteKeyContext, scopes: ScopeRange[] = []): KeyInDocument[] {
  if (Config.disablePathParsing)
    dotEnding = true

  const keys = []
  const starts: number[] = []

  for (const reg of regs) {
    let match = null
    reg.lastIndex = 0
    while (match = reg.exec(text)) {
      const matchString = match[0]
      let key = match[1]
      const start = match.index + matchString.lastIndexOf(key)
      const end = start + key.length
      const scope = scopes.find(s => s.start <= start && s.end >= end)

      // prevent duplicated detection when multiple frameworks enables at the same time.
      if (starts.includes(start))
        continue
      starts.push(start)

      // prefix the namespace
      if (key && scope?.namespace)
        key = `${scope.namespace}.${key}`

      if (key && (dotEnding || !key.endsWith('.'))) {
        key = CurrentFile.loader.rewriteKeys(key, 'reference', {
          ...rewriteContext,
          namespace: scope?.namespace,
        })
        keys.push({
          key,
          start,
          end,
        })
      }
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
