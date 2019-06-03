
export const LanguageIds = [
  'vue',
  'vue-html',
  'javascript',
  'typescript',
]

export const LanguageSelectors = LanguageIds
  .map(language => ({ language, schema: '*' }))

export const isSupported = (id: string) => LanguageIds.includes(id)
