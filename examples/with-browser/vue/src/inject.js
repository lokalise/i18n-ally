export function inject(i18n) {
  const script = document.createElement('script')
  script.setAttribute('src', 'http://127.0.0.1:1897/static/client.js')
  document.head.appendChild(script)

  const keys = new Set()

  // spy on $t
  const _translate = i18n._translate
  i18n._translate = (...args) => {
    // console.log(args)
    keys.add(args[3])
    return _translate.apply(i18n, args)
  }

  window.addEventListener('i18n-ally-ready', (e) => {
    const i18nAlly = e.detail.i18nAlly
    i18nAlly.register({
      name: 'vue-i18n',
      getCurrentLocale: () => i18n.locale,
      getKeys: () => Array.from(keys),
    })
  })
}
