
export const SupportedFrameworks = [
  'vue-i18n',
  'vuex-i18n',
  '@panter/vue-i18next',
  'nuxt-i18n',
]

export const SupportedLanguageIds = [
  'vue',
  'vue-html',
  'javascript',
  'typescript',
]

export const SupportedLanguageGlobs = '**/*.{js,jsx,ts,tsx,vue}'

export const LanguageSelectors = SupportedLanguageIds
  .map(language => ({ language, schema: 'file' }))

export const isLanguageIdSupported = (id: string) => SupportedLanguageIds.includes(id)
