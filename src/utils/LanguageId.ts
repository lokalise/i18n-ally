
export const LanguageIdExtMap = {
  javascript: 'js',
  typescript: 'ts',
  typescriptreact: 'jsx',
  tyspescriptreact: 'tsx',
  vue: 'vue',
  'vue-html': 'vue',
  json: 'json',
  dart: 'dart',
}

export type LanguageId = keyof typeof LanguageIdExtMap

export function getExtOfLanguageId (id: LanguageId) {
  return LanguageIdExtMap[id]
}
