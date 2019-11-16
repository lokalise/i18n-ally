export const EXT_NAMESPACE = 'vue-i18n-ally'
export const EXT_ID = 'antfu.vue-i18n-ally'
export const EXT_NAME = 'Vue i18n Ally'

export const SUPPORTED_LANG_IDS = [
  'vue',
  'vue-html',
  'javascript',
  'typescript',
]

export const REFACTOR_TEMPLATES = (keypath: string, languageId?: string) => [
  `{{$t('${keypath}')}}`,
  `this.$t('${keypath}')`,
  `$t("${keypath}")`,
  `i18n.t('${keypath}')`,
  keypath,
]

export const SUPPORTED_LANG_GLOBS = '**/*.{js,jsx,ts,tsx,mjs,vue}'

export const MATCH_REG_FILE = '^([\\w-_]*)\\.(json5?|ya?ml|jsx?|tsx?|mjs)$'

export const MATCH_REG_DIR = '^(.*)\\.(json5?|ya?ml|jsx?|tsx?|mjs)$'

export const LANG_SELECTORS = SUPPORTED_LANG_IDS
  .map(language => ({ language, schema: 'file' }))

export const isLanguageIdSupported = (id: string) =>
  SUPPORTED_LANG_IDS.includes(id)
