import * as path from 'path'
import Common from './Common'

export function getKeyname (keypath: string) {
  const keys = keypath.split(/\./g)
  if (!keys.length)
    return ''
  return keys[keys.length - 1]
}

export function getFileInfo (filepath: string) {
  const info = path.parse(filepath)

  let locale = Common.normalizeLng(info.name, '')
  let nested = false
  if (!locale) {
    nested = true
    locale = Common.normalizeLng(path.basename(info.dir), '')
  }
  if (!locale)
    console.error(`Failed to get locale on file ${filepath}`)

  return {
    locale,
    nested,
  }
}

export function replaceLocalePath (filepath: string, targetLocale: string): string {
  const info = path.parse(filepath)

  if (Common.normalizeLng(info.name, ''))
    return path.resolve(info.dir, `${targetLocale}${info.ext}`)

  if (Common.normalizeLng(path.basename(info.dir), ''))
    return path.resolve(path.dirname(info.dir), targetLocale, `${info.name}${info.ext}`)

  return ''
}
