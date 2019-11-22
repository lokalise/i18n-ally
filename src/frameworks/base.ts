import { DirStructure } from '../core'

export abstract class Framework {
  abstract id: string
  abstract display: string

  /**
   * Packages names determine whether a frameworks should enable or not
   */
  abstract detection: {
    packageJSON: string[] | { none?: string[]; every?: string[]; any?: string[] } | ((packages: string[]) => boolean)
  }

  /**
   * Language Ids to enables annotations
   */
  abstract languageIds: string[]

  /**
   * Array of regex for detect keys in document
   */
  abstract keyMatchReg: RegExp | RegExp[] | ((languageId?: string, filepath?: string) => RegExp| RegExp[])

  /**
   * Return possible choices of replacement for messages extracted from code
   */
  abstract refactorTemplates (keypath: string, languageId?: string): string[]

  /**
   * Locale file's name match
   */
  filenameMatchReg (dirStructure?: DirStructure): RegExp | string {
    if (dirStructure === 'file')
      return '^([\\w-_]*)\\.(json5?|ya?ml|jsx?|tsx?|mjs)$'
    else
      return '^(.*)\\.(json5?|ya?ml|jsx?|tsx?|mjs)$'
  }

  getKeyMatchReg (languageId = '*', filepath?: string): RegExp[] {
    let reg: RegExp | RegExp[] | undefined
    if (typeof this.keyMatchReg === 'function')
      reg = this.keyMatchReg(languageId, filepath)
    else
      reg = this.keyMatchReg

    if (!Array.isArray(reg))
      reg = [reg]

    return reg
  }
}
