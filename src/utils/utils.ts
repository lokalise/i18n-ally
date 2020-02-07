import * as path from 'path'
import { Node, LocaleTree, LocaleNode, LocaleRecord } from '../core'
import { PendingWrite, KeyStyle } from '../core/types'
import { ROOT_KEY } from './flat'
import { Log } from '.'
import { set } from 'lodash'

export function caseInsensitiveMatch(a: string, b: string) {
  return a.toUpperCase() === b.toUpperCase()
}

export function normalizeLocale(locale: string, fallback = 'en', strict = false): string {
  if (!locale)
    return fallback

  try {
    locale = locale.replace(/_/g, '-')
    if (locale.split('-')[0].length !== 2)
      return fallback
    // @ts-ignore
    const canonical = Intl.getCanonicalLocales(locale)[0]
    if (strict)
      return Intl.Collator.supportedLocalesOf(canonical, { localeMatcher: 'lookup' })[0]
    return canonical
  }
  catch (e) {
    Log.info(`Invalid locale code "${locale}"\n${e.toString()}`)
    return fallback
  }
}

export function getKeyname(keypath: string) {
  const keys = keypath.split(/\./g)
  if (!keys.length)
    return ''
  return keys[keys.length - 1]
}

export function notEmpty<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}

export function getFlagFilename(locale: string) {
  const parts = locale.toLocaleLowerCase().split('-', 2)
  const flag = parts[parts.length - 1]
  return `${flag}.svg`
}

export function replaceLocalePath(filepath: string, targetLocale: string): string {
  const info = path.parse(filepath)

  if (normalizeLocale(info.name, ''))
    return path.resolve(info.dir, `${targetLocale}${info.ext}`)

  if (normalizeLocale(path.basename(info.dir), ''))
    return path.resolve(path.dirname(info.dir), targetLocale, `${info.name}${info.ext}`)

  return ''
}

export function escapeMarkdown(text: string) {
  return text
    .replace(/\|/g, '\\|')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
}

export function resolveFlattenRootKeypath(keypath: string) {
  if (keypath.endsWith(ROOT_KEY))
    keypath = keypath.slice(0, -ROOT_KEY.length)
  if (keypath.endsWith('.'))
    keypath = keypath.slice(0, -1)
  return keypath
}

export function resolveFlattenRoot (node: undefined): undefined
export function resolveFlattenRoot (node: LocaleRecord): LocaleRecord
export function resolveFlattenRoot (node: LocaleTree | LocaleNode): LocaleTree | LocaleNode
export function resolveFlattenRoot (node?: LocaleTree | LocaleNode): LocaleTree | LocaleNode | undefined
export function resolveFlattenRoot(node?: Node) {
  if (node?.type === 'tree' && node.getChild(ROOT_KEY)?.type === 'node')
    return node.getChild(ROOT_KEY)
  return node
}

export function applyPendingToObject(obj: any, pending: PendingWrite, keyStyle?: KeyStyle) {
  const keypath = resolveFlattenRootKeypath(pending.keypath)

  if (keyStyle === 'flat')
    obj[keypath] = pending.value
  else
    set(obj, keypath, pending.value)
  return obj
}
