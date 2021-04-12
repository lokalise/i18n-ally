export function parseHardString(text = '', languageId?: string) {
  const trimmed = text.trim().replace(/\s*\r?\n\s*/g, ' ')
  let processed = trimmed
  const args: string[] = []
  if (!trimmed)
    return null

  if (languageId === 'vue') {
    processed = processed.replace(/(?:\{\{(.*?)\}\}|\$\{(.*?)\})/g, (full, content = '') => {
      args.push(content.trim())
      return `{${args.length - 1}}`
    })
  }

  return {
    trimmed,
    text: processed,
    args,
  }
}
