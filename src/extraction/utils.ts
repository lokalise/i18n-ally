import { DetectionResult } from '~/core/types'

const regexLeading = /^[\s\n]*/mg
const regexTailing = /[\s\n]+$/mg

export function trimDetection(detection: DetectionResult): DetectionResult | undefined {
  const leadingSpace = detection.text.match(regexLeading)?.[0] || ''
  const tailingSpace = detection.text.match(regexTailing)?.[0] || ''
  detection.start += leadingSpace.length
  detection.end -= tailingSpace.length

  if (detection.start >= detection.end)
    return undefined

  return detection
}
