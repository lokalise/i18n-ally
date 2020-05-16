import { I18nAlly } from '../client'

export default function(ally: I18nAlly, i18n) {
  const keys = new Set<string>()

  // spy on $t
  const _translate = i18n._translate
  i18n._translate = (...args) => {
    // console.log(args)
    keys.add(args[3])
    return _translate.apply(i18n, args)
  }

  ally.register({
    name: 'vue-i18n',
    getCurrentLocale: () => i18n.locale,
    getKeys: () => Array.from(keys),
    updateMessages: (locale, key, value) => {
      i18n.mergeLocaleMessage(locale, { [key]: value })
    },
    setLocale: (locale) => {
      i18n.locale = locale
    },
  })
}
