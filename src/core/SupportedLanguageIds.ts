
export const LanguageIds = [
  'vue',
  'vue-html',
  'javascript',
  'typescript',
]

export const LanguageSelectors = LanguageIds
  .map(language => ({ language, schema: 'file' }))

export const isSupportedLanguageId = (id: string) => LanguageIds.includes(id)
