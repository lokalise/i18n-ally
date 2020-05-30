// @ts-ignore
import { observe } from 'selector-observer'
import adaptors from './adaptors/index'

export interface I18nAllyAdaptor {
  name: string
  instance?: any
  locale: string
  keys: string[]
  on: (event: string, listener: Function) => void
  off: (event: string, listener: Function) => void
  updateMessages?: (locale: string, key: string, value: string) => void
  getMessage?: (locale: string, key: string) => string
}

export class I18nAlly {
  private _listeners: Record<number, Function> = {}
  private _id_count = 0
  private _edit = false
  private _started = false
  private _editingKey =''
  private _adaptor: I18nAllyAdaptor = {
    name: 'none',
    keys: [],
    locale: '',
    on: () => {},
    off: () => {},
  }

  constructor(
    public readonly url = 'localhost:1897',
  ) {

  }

  start() {
    if (this._started)
      return

    this._started = true
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

  register(adaptor: I18nAllyAdaptor) {
    console.log(
      `%c i18n Ally %c Adaptor "${adaptor.name}" Registered %c`,
      'background:#70C9C7 ; padding: 1px; border-radius: 3px 0 0 3px;  color: #334A5D',
      'background:#334A5D ; padding: 1px; border-radius: 0 3px 3px 0;  color: #fffd',
      'background:transparent',
    )
    this._adaptor = adaptor
    this._adaptor.on('keys', () => this.updateUsingKeys())
    this.updateUsingKeys()
    this.send({ type: 'devtools.ready' })
    this.start()
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

  updateUsingKeys() {
    const keys = this._adaptor.keys

    this.send({
      type: 'context',
      data: {
        keys: keys.map(key => ({
          key,
          value: this._adaptor.getMessage(this._adaptor.locale, key),
        })),
        index: keys.indexOf(this._editingKey),
      },
    })
  }

  injectStyle() {
    const style = document.createElement('style')
    style.textContent = `
      [data-i18n-ally-binding].i18n-ally-active{background: #fffa00ee;}
    `
    document.head.appendChild(style)
  }

  private setActive(key: string) {
    document
      .querySelectorAll('[data-i18n-ally-key]')
      .forEach((e) => {
        // @ts-ignore
        e.classList.toggle('i18n-ally-active', e.dataset?.i18nAllyKey === key)
      })
  }

  get currentLocale() {
    return this._adaptor.locale
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

  send(message: any) {
    window.postMessage({
      source: 'i18n-ally-client',
      message,
    }, '*')
  }

  emit(raw) {
    const message = JSON.parse(raw) || {}
    switch (message.type) {
      case 'devtools.text-update':
        this._adaptor?.updateMessages(message.locale, message.keypath, message.value)
        break
      case 'devtools.locale-change':
        this._adaptor.locale = message.locale
        break
      case 'devtools.clear-keys':
        this._adaptor.keys = []
        break
      case 'edit-key':
        this._editingKey = message.keypath
        this.setActive(message.keypath)
        break
    }
  }
}

(() => {
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
