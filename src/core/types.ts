import { Range, TextDocument } from 'vscode'

export interface OptionalFeatures {
  VueSfc?: boolean
  FluentVueSfc?: boolean
  LinkedMessages?: boolean
  namespace?: boolean
}

export interface NodeMeta {
  VueSfcSectionIndex?: number
  VueSfcLocale?: string
  namespace?: string
}

export interface FileInfo {
  filepath: string
  dirpath: string
  locale: string
  mtime: number
  readonly?: boolean
  namespace?: string
  matcher?: string
}

export interface ReviewComment {
  id: string
  type?: 'approve' | 'request_change' | 'comment'
  comment?: string
  suggestion?: string
  user?: {
    name?: string
    email?: string
  }
  time?: string
  resolved?: boolean
}

export interface ReviewCommentWithMeta extends ReviewComment {
  keypath: string
  locale: string
}

export interface TranslationCandidate {
  source: string
  text: string
  time: string
}

export interface TranslationCandidateWithMeta extends TranslationCandidate {
  keypath: string
  locale: string
}

export interface ReviewData {
  reviews: Record<string, {
    description?: string
    locales?: Record<string, {
      translation_candidate?: TranslationCandidate
      comments?: ReviewComment[]
    }>
  }>
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

export type SortCompare = 'binary' | 'locale'

export interface Coverage {
  locale: string
  translated: number
  total: number
  missing: number
  allKeys: string[]
  translatedKeys: string[]
  missingKeys: string[]
  emptyKeys: string[]
}

export interface PendingWrite {
  textFromPath?: string
  locale: string
  keypath: string
  filepath?: string
  value?: string
  namespace?: string
  features?: OptionalFeatures
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
  quoted: boolean
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

export type RewriteKeySource = 'source' | 'reference' | 'write'
export type KeyStyle = 'auto' | 'nested' | 'flat'

export interface RewriteKeyContext {
  locale?: string
  targetFile?: string
  namespace?: string
}

export interface DataProcessContext {
  locale?: string
  targetFile?: string
}

export enum TargetPickingStrategy {
  None = 'none',
  MostSimilar = 'most-similar',
  FilePrevious ='file-previous',
  GlobalPrevious = 'global-previous',
  MostSimilarByKey = 'most-similar-by-key',
}

export type DetectionSource = 'html-attribute' | 'html-inline' | 'js-string' | 'js-template' | 'jsx-text'

export interface DetectionResult {
  text: string
  start: number
  end: number
  document?: TextDocument
  isDynamic?: boolean
  fullText?: string
  fullStart?: number
  fullEnd?: number
  source: DetectionSource
}

export interface ExtractInfo {
  range: Range
  replaceTo: string
  keypath?: string
  message?: string
  locale?: string
}

export interface CustomRefactorTemplate {
  source?: DetectionSource
  templates: string[]
  include?: string[]
  exclude?: string[]
}
