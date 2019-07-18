export const EXT_NAMESPACE = 'vue-i18n-ally'
export const EXT_NAME = 'Vue i18n Ally'

export const SUPPORTED_FRAMEWORKS = [
  'vue-i18n',
  'vuex-i18n',
  '@panter/vue-i18next',
  'nuxt-i18n',
]

export const SUPPORTED_LANG_IDS = [
  'vue',
  'vue-html',
  'javascript',
  'typescript',
]

// for visualize the regex, you can use https://regexper.com/
// eslint-disable-next-line no-useless-escape
export const KEY_REG = /(?:i18n[ (]path=|v-t=['"`{]|(?:this\.|\$|i18n\.)(?:(?:d|n)\(.*?, ?|(?:t|tc|te)\())['"`]([\w\d\.]+?)['"`]/g

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
