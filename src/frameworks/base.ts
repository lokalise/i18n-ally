import { DirStructure } from '../core'

type LanguageId = string

export abstract class Framework {
  abstract id: string
  abstract display: string

  abstract detection: {
    packageJSON: string[] | ((packages: string[]) => boolean)
  }

  /**
   * Language Ids to enables annotations
   */
  abstract languageIds: string[]

  /**
   * Object of array of regex for detect keys in document
   */
  abstract keyMatchReg: Record<LanguageId, RegExp[]>

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
}
