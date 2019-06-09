import { workspace } from 'vscode'
import * as path from 'path'
import * as fs from 'fs'
import LanguageCodes from '../meta/LanguageCodes'
import { Global } from './Global'

export function caseInsensitiveMatch (a: string, b: string) {
  return a.toUpperCase() === b.toUpperCase()
}

export function normalizeLocale (locale: string, fallback = 'en'): string {
  if (!locale)
    return fallback

  const result = LanguageCodes.find(codes => {
    return Array.isArray(codes)
      ? !!codes.find(c => caseInsensitiveMatch(c, locale))
      : caseInsensitiveMatch(locale, codes)
  }) || fallback

  return Array.isArray(result)
    ? result[0].toString()
    : result
}

export function getKeyname (keypath: string) {
  const keys = keypath.split(/\./g)
  if (!keys.length)
    return ''
  return keys[keys.length - 1]
}

export function getFileInfo (filepath: string) {
  const info = path.parse(filepath)

  let locale = normalizeLocale(info.name, '')
  let nested = false
  if (!locale) {
    nested = true
    locale = normalizeLocale(path.basename(info.dir), '')
  }
  if (!locale)
    console.error(`Failed to get locale on file ${filepath}`)

  return {
    locale,
    nested,
  }
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

const SupportedFrameworks = [
  'vue-i18n',
  'vuex-i18n',
  '@panter/vue-i18next',
  'nuxt-i18n',
]

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

export function unicodeProgress (progress: number, width: number) {
  progress = Math.min(1, Math.max(0, progress))
  const whole_width = Math.floor(progress * width)
  const remainder_width = progress * width - whole_width || 0
  const part_width = Math.floor(remainder_width * 8) || 0
  let part_char = [' ', '▏', '▎', '▍', '▌', '▋', '▊', '▉'][part_width]
  if (width - whole_width - 1 < 0)
    part_char = ''
  const space_width = Math.max(width - whole_width - 1, 0)
  const line = `${'█'.repeat(whole_width)}${part_char}${'  '.repeat(space_width)}`
  return line
}
