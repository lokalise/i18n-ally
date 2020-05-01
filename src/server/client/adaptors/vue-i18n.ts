export default function(ally, i18n) {
  const keys = new Set()

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
  })
}
