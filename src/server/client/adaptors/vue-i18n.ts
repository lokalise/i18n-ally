import { I18nAlly } from '../client'
import { ListenerHost } from '../listenerHost'

export default function(ally: I18nAlly, i18n) {
  let _keys = new Set<string>()
  const _listener = new ListenerHost()

  // spy on $t and get used keys
  const _translate = i18n._translate
  i18n._translate = (...args) => {
    const [,,, key] = args
    _keys.add(key)
    _listener.emit('keys')
    return _translate.apply(i18n, args)
  }

  ally.register({
    name: 'vue-i18n',
    instance: i18n,
    get locale() {
      return i18n.locale
    },
    set locale(v) {
      i18n.locale = v
    },
    get keys() {
      return Array.from(_keys)
    },
    set keys(v) {
      _keys = new Set(v)
    },
    on: _listener.on.bind(_listener),
    off: _listener.off.bind(_listener),
    updateMessages: (locale, key, value) => {
      if (value)
        i18n.mergeLocaleMessage(locale, { [key]: value })
    },
    getMessage: (locale, key) => {
      return i18n.messages[locale][key]
    },
  })
}
