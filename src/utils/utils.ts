import { workspace } from 'vscode'
import * as path from 'path'
import * as fs from 'fs'
import { Global } from '../core'
import { SupportedFrameworks } from '../meta'

export function caseInsensitiveMatch (a: string, b: string) {
  return a.toUpperCase() === b.toUpperCase()
}

export function normalizeLocale (locale: string, fallback = 'en'): string {
  if (!locale)
    return fallback

  try {
    // @ts-ignore
    return Intl.getCanonicalLocales(locale)[0]
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
