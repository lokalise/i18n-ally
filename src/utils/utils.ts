import { set } from 'lodash'
import { Node, LocaleTree, LocaleNode, LocaleRecord, Config } from '../core'
import { KeyStyle } from '../core/types'
import { ROOT_KEY } from './flat'

export function caseInsensitiveMatch(a: string, b: string) {
  return a.toUpperCase() === b.toUpperCase()
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

export function applyPendingToObject(obj: any, keypath: string, value: any, keyStyle?: KeyStyle) {
  if (!Config.disablePathParsing)
    keypath = resolveFlattenRootKeypath(keypath)

  if (keyStyle === 'flat')
    obj[keypath] = value
  else
    set(obj, keypath, value)

  return obj
}
