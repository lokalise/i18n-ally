import * as path from 'path'
import { workspace } from 'vscode'
import _ from 'lodash'
import { PendingWrite, Config } from '../core'
import { Log, File } from '.'

export function caseInsensitiveMatch (a: string, b: string) {
  return a.toUpperCase() === b.toUpperCase()
}

export function normalizeLocale (locale: string, fallback = 'en', strict = false): string {
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

export function getKeyname (keypath: string) {
  const keys = keypath.split(/\./g)
  if (!keys.length)
    return ''
  return keys[keys.length - 1]
}

export function notEmpty<T> (value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}

export function getFlagFilename (locale: string) {
  const parts = locale.toLocaleLowerCase().split('-', 2)
  const flag = parts[parts.length - 1]
  return `${flag}.svg`
}

export function replaceLocalePath (filepath: string, targetLocale: string): string {
  const info = path.parse(filepath)

  if (normalizeLocale(info.name, ''))
    return path.resolve(info.dir, `${targetLocale}${info.ext}`)

  if (normalizeLocale(path.basename(info.dir), ''))
    return path.resolve(path.dirname(info.dir), targetLocale, `${info.name}${info.ext}`)

  return ''
}

export function escapeMarkdown (text: string) {
  return text
    .replace(/\|/g, '\\|')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
}

export function getPackageDependencies (projectUrl: string): string[] {
  if (!projectUrl || !workspace.workspaceFolders)
    return []

  try {
    const rawPackageJSON = File.readSync(`${projectUrl}/package.json`)
    const {
      dependencies = {},
      devDependencies = {},
      peerDependencies = {},
    } = JSON.parse(rawPackageJSON)

    return [...Object.keys(dependencies), ...Object.keys(devDependencies), ...Object.keys(peerDependencies)]
  }
  catch (err) {
    Log.info('Error on parsing package.json')
  }
  return []
}

export async function applyPendingToObject (obj: any, pending: PendingWrite) {
  const keyStyle = await Config.requestKeyStyle()
  if (keyStyle === 'flat')
    obj[pending.keypath] = pending.value
  else
    _.set(obj, pending.keypath, pending.value)
  return obj
}
