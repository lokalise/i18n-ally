import { Config } from '../core'
import { LanguageId, Log } from '../utils'
import { DirStructure, OptionalFeatures, RewriteKeySource, RewriteKeyContext, DataProcessContext } from '../core/types'
import { ParserExtRegEx } from '../meta'
import i18n from '../i18n'

export type FrameworkDetectionDefine = string[] | { none?: string[]; every?: string[]; any?: string[] } | ((packages: string[], root: string) => boolean)

export type PackageFileType
= 'packageJSON'
| 'pubspecYAML'
| 'composerJSON'
| 'gemfile'
| 'none'

export abstract class Framework {
  abstract id: string
  abstract display: string
  monopoly?: boolean
  enabledParsers?: string[]

  /**
   * Packages names determine whether a frameworks should enable or not
   */
  abstract detection: Partial<Record<PackageFileType, FrameworkDetectionDefine>>

  /**
   * Language Ids to enables annotations
   */
  abstract languageIds: LanguageId[]

  /**
   * Array of regex for detect keys in document
   */
  abstract keyMatchReg: string | RegExp | (string | RegExp)[] | ((languageId?: string, filepath?: string) => string | RegExp | (string | RegExp)[])

  /**
   * Return possible choices of replacement for messages extracted from code
   */
  abstract refactorTemplates (keypath: string, languageId?: string): string[]

  /**
   * Locale file's name match
   */
  pathMatcher(dirStructure?: DirStructure): RegExp | string {
    if (dirStructure === 'file')
      return `{locale}.{${ParserExtRegEx}}`
    else
      return `{locale}/**/*.{${ParserExtRegEx}}`
  }

  enableFeatures?: OptionalFeatures

  getKeyMatchReg(languageId = '*', filepath?: string): RegExp[] {
    let reg: string | RegExp | (string | RegExp)[] | undefined
    if (typeof this.keyMatchReg === 'function')
      reg = this.keyMatchReg(languageId, filepath)
    else
      reg = this.keyMatchReg

    if (!Array.isArray(reg))
      reg = [reg]

    return reg.map((i) => {
      if (typeof i === 'string') {
        try {
          return new RegExp(i.replace(/\{key\}/g, Config.keyMatchRegex), 'gm')
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

  rewriteKeys(key: string, source: RewriteKeySource, context: RewriteKeyContext = {}) {
    return key
  }

  preprocessData(data: object, context: DataProcessContext): object {
    return data
  }

  deprocessData(data: object, context: DataProcessContext): object {
    return data
  }
}
