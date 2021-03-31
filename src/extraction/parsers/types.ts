import { TextDocument, TextEditor } from 'vscode'

export interface DetectionResult {
  text: string
  start: number
  end: number
  document?: TextDocument
  editor?: TextEditor
  isDynamic?: boolean
  fullText?: string
  fullStart?: number
  fullEnd?: number
  type: 'attribute' | 'inline'
}
