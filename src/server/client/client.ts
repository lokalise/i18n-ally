// @ts-ignore
import { observe } from 'selector-observer'
import adaptors from './adaptors/index'

export interface I18nAllyAdaptor {
  name: string
  getCurrentLocale: () => string
  getKeys: () => string[]
  setLocale?: (locale: string) => void
  updateMessages?: (locale: string, key: string, value: string) => void
}

export class I18nAlly {
  _listeners: Record<number, Function> = {}
  _id_count = 0
  _edit = false
  _started = false
  _adaptor: I18nAllyAdaptor = {
    name: 'none',
    getCurrentLocale() { throw new Error('NOT REGISTED') },
    getKeys: () => [],
  }

  ws: WebSocket

  constructor(
    public readonly url = 'localhost:1897',
  ) {

  }

  start() {
    if (this._started)
      return

    this._started = true
    this.ws = new WebSocket(`ws://${this.url}`)
    this.ws.onmessage = (e) => {
      const data = JSON.parse(e.data)
      // console.log(data)
      if (data._id && this._listeners[data._id])
        this._listeners[data._id](data)
    }
    this.injectStyle()
    observe('[data-i18n-ally-key]', {
      add: (e: Element) => {
        const original = e.textContent.toString()
        const keypath = e.getAttribute('data-i18n-ally-key')
        if (!keypath)
          return

        if (this._edit)
          e.setAttribute('contenteditable', 'true')
        else
          e.removeAttribute('contenteditable')

        // already bind
        if (e.getAttribute('data-i18n-ally-binding'))
          return

        e.setAttribute('data-i18n-ally-binding', 'true')
        e.addEventListener('mousedown', (e) => {
          if (!this._edit)
            return
          e.stopPropagation()
          e.stopImmediatePropagation()
        })
        e.addEventListener('blur', () => {
          if (!this._edit)
            return
          const value = e.textContent.toString()
          if (value && value !== original)
            this.setRecord(keypath, this.currentLocale, value)
        })
      },
    })
  }

  register(adaptor: Partial<I18nAllyAdaptor>) {
    console.log(
      `%c i18n Ally %c Adaptor "${adaptor.name}" Registered %c`,
      'background:#70C9C7 ; padding: 1px; border-radius: 3px 0 0 3px;  color: #334A5D',
      'background:#334A5D ; padding: 1px; border-radius: 0 3px 3px 0;  color: #fffd',
      'background:transparent',
    )
    this._adaptor = Object.assign(this._adaptor, adaptor)
    this.start()
  }

  send(data: any) {
    if (!this._started)
      throw new Error('i18n Ally client is not runing')
    this.ws.send(JSON.stringify(data))
  }

  async call(data: any) {
    return new Promise((resolve) => {
      const id = this._id_count++
      this._listeners[id] = (data: any) => {
        delete this._listeners[id]
        resolve(data)
      }
      this.send({ ...data, _id: id })
    })
  }

  getRecord(keypath: string, locale: string) {
    return this.call({ type: 'get_record', keypath, locale })
  }

  setRecord(keypath: string, locale: string, value: string) {
    return this.call({ type: 'set_record', keypath, locale, value })
  }

  injectStyle() {
    const style = document.createElement('style')
    style.textContent = `
      [data-i18n-ally-binding][contenteditable]{background: yellow;}
    `
    document.head.appendChild(style)
  }

  get currentLocale() {
    return this._adaptor.getCurrentLocale()
  }

  get edit() {
    return this._edit
  }

  set edit(v) {
    this._edit = v
    if (this._edit)
      this.editOn()
    else
      this.editOff()
  }

  private editOn() {
    document.querySelectorAll('[data-i18n-ally-key]').forEach((e) => {
      const keypath = e.getAttribute('data-i18n-ally-key')
      if (keypath)
        e.setAttribute('contenteditable', 'true')
    })
  }

  private editOff() {
    document.querySelectorAll('[data-i18n-ally-key]').forEach((e) => {
      e.removeAttribute('contenteditable')
    })
  }

  emit(raw) {
    const message = JSON.parse(raw) || {}
    console.log(message)
    switch (message.type) {
      case 'devtools.text-update':
        this._adaptor?.updateMessages(message.locale, message.keypath, message.value)
        break
      case 'devtools.locale-change':
        this._adaptor?.setLocale(message.locale)
        break
    }
  }
}

;(() => {
  // @ts-ignore
  if (window.$i18nAlly)
    return

  const i18nAlly = new I18nAlly()
  // @ts-ignore
  window.$i18nAlly = i18nAlly

  function register({ name, instance }: {name: string; instance: any}) {
    const adaptor = adaptors[name]
    if (!adaptor) {
      console.warn(`[i18n Ally] Unknown adaptor ${name}`)
      return
    }
    adaptor(i18nAlly, instance)
  }

  function loadConfig() {
    // @ts-ignore
    let _v = window.$i18nAllyConfig
    // config already set, register now
    if (_v)
      register(_v)

    // make $i18nAllyConfig reactive
    Object.defineProperty(window, '$i18nAllyConfig', {
      set(v) {
        register(v)
        _v = v
      },
      get() {
        return _v
      },
    })

    window.dispatchEvent(new CustomEvent<any>('i18n-ally-ready', { detail: { i18nAlly } }))
    i18nAlly.edit = true
  }

  window.addEventListener('i18n-ally-register', (e: any) => {
    register(e.detail)
  })

  loadConfig()
})()
