/* eslint-disable @typescript-eslint/interface-name-prefix */
import { Range } from 'vscode'

export interface OptionalFeatures {
  VueSfc?: boolean
  LinkedMessages?: boolean
}

export interface NodeMeta {
  VueSfcSectionIndex?: number
  VueSfcLocale?: string
}

export interface FileInfo {
  filepath: string
  locale: string
  nested: boolean
  readonly?: boolean
}

export interface ParsedFile extends FileInfo {
  value: object
}

export interface NodeOptions {
  locale: string
  readonly?: boolean
  filepath: string
  features?: OptionalFeatures
  meta?: NodeMeta
}

export type DirStructureAuto = 'auto' | 'file' | 'dir'
export type DirStructure = 'file' | 'dir'

export interface Coverage {
  locale: string
  translated: number
  total: number
  missing: number
  totalKeys: string[]
  translatedKeys: string[]
  missingKeys: string[]
  emptyKeys: string[]
}

export interface PendingWrite {
  locale: string
  keypath: string
  filepath?: string
  value?: string
  features?: OptionalFeatures
}

export interface ExtractTextOptions {
  filepath: string
  text: string
  range: Range
  languageId?: string
}

export interface PositionRange {
  start: number
  end: number
}

export interface ParserOptions {
  indent: number
  tab: string
}

export interface KeyInDocument {
  start: number
  end: number
  key: string
}

export interface KeyOccurrence {
  keypath: string
  filepath: string
  start: number
  end: number
}

export interface KeyUsage {
  keypath: string
  occurrences: KeyOccurrence[]
}

export interface UsageReport {
  active: KeyUsage[]
  idle: KeyUsage[]
  missing: KeyUsage[]
}
