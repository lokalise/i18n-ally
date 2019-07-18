import * as path from 'path'
import * as fs from 'fs'
import { workspace } from 'vscode'
import { Global } from '../core'
import { SupportedFrameworks } from '../meta'

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
    Global.outputChannel.appendLine(`Invalid locale code "${locale}"\n${e.toString()}`)
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

export function isVueI18nProject (projectUrl: string): boolean {
  if (!projectUrl || !workspace.workspaceFolders)
    return false

  try {
    const rawPackageJSON = fs.readFileSync(`${projectUrl}/package.json`, 'utf-8')
    const {
      dependencies = {},
      devDependencies = {},
    } = JSON.parse(rawPackageJSON)

    for (const framework of SupportedFrameworks) {
      if (framework in dependencies || framework in devDependencies)
        return true
    }
  }
  catch (err) {
    Global.outputChannel.appendLine('Error on parsing package.json')
  }
  return false
}
