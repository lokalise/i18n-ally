
export const LanguageIdExtMap = {
  javascript: 'js',
  typescript: 'ts',
  typescriptreact: 'jsx',
  tyspescriptreact: 'tsx',
  vue: 'vue',
  'vue-html': 'vue',
  json: 'json',
  html: 'html',
  dart: 'dart',
  php: 'php',
}

export type LanguageId = keyof typeof LanguageIdExtMap

export function getExtOfLanguageId (id: LanguageId) {
  return LanguageIdExtMap[id]
}
