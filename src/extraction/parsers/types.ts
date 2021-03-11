export interface DetectionResult {
  text: string
  start: number
  end: number
  isDynamic?: boolean
  fullText?: string
  fullStart?: number
  fullEnd?: number
  type: 'attribute' | 'inline'
}
