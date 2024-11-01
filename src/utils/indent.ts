export function determineJSONTabSize(jsonText: string): number | null {
  const lines = jsonText.split('\n')

  for (const line of lines) {
    const match = line.match(/^(\s+)/)
    if (match && match[1]) return match[1].length
  }

  return null
}

export function determineJSON5TabSize(jsonText: string): number | null {
  const lines = jsonText.split('\n')

  for (const line of lines) {
    const match = line.match(/^(\s*)(\{|\"|\[)/)
    if (match && match[1]) return match[1].length
  }

  return null
}

export function determineYamlTabSize(yamlText: string): number | null {
  const lines = yamlText.split('\n')

  for (const line of lines) {
    const match = line.match(/^(\s+)[^\s#]/)
    if (match && match[1])
      return match[1].length
  }

  return null
}
