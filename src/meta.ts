export const EXT_NAMESPACE = 'i18n-ally'
export const EXT_ID = 'antfu.i18n-ally'
export const EXT_NAME = 'i18n Ally'
export const EXT_EDITOR_ID = 'i18n-ally-editor'
export const EXT_REVIEW_ID = 'i18n-ally-review'

export const EXT_LEGACY_ID = 'antfu.vue-i18n-ally'
export const EXT_LEGACY_NAMESPACE = 'vue-i18n-ally'

export const KEEP_FULFILL_DELAY = 1000

export const KEY_REG_DEFAULT = '[\\w\\d\\. \\-\\[\\]\\:]*?'
export const KEY_REG_ALL = '.*?'

export const linkKeyMatcher = /(?:@(?:\.[a-z]+)?:(?:[\w\-_|.]+|\([\w\-_|.]+\)))/g
export const linkKeyPrefixMatcher = /^@(?:\.([a-z]+))?:/
export const bracketsMatcher = /[()]/g
export const linkedKeyModifiers = {
  upper: (str: string) => str.toLocaleUpperCase(),
  lower: (str: string) => str.toLocaleLowerCase(),
} as Record<string, (str: string) => string>
