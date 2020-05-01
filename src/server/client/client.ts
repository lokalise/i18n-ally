import adaptors from './adaptors/index'

interface I18nAllyAdaptor {
  name: string
  getCurrentLocale: () => string
  getKeys: () => string[]
}

class I18nAlly {
  _listeners: Record<number, Function> = {}
  _id_count = 0
  _edit = false
  _adaptor: I18nAllyAdaptor = {
    name: 'none',
    getCurrentLocale() { throw new Error('NOT REGISTED') },
    getKeys: () => [],
  }

  ws: WebSocket

  constructor(url = 'localhost:1897') {
    this.ws = new WebSocket(`ws://${url}`)
    this.ws.onmessage = (e) => {
      const data = JSON.parse(e.data)
      console.log(data)
      if (data._id && this._listeners[data._id])
        this._listeners[data._id](data)
    }
  }

  register(adaptor: Partial<I18nAllyAdaptor>) {
    console.log(
      `%c i18n Ally %c Adaptor "${adaptor.name}" Registered %c`,
      'background:#70C9C7 ; padding: 1px; border-radius: 3px 0 0 3px;  color: #334A5D',
      'background:#334A5D ; padding: 1px; border-radius: 0 3px 3px 0;  color: #fffd',
      'background:transparent',
    )
    this._adaptor = Object.assign(this._adaptor, adaptor)
  }

  send(data: any) {
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
      const original = e.textContent.toString()
      const keypath = e.getAttribute('data-i18n-ally-key')
      if (keypath) {
        e.setAttribute('contenteditable', 'true')
        if (!e.getAttribute('data-i18n-ally-binding')) {
          e.setAttribute('data-i18n-ally-binding', 'true')
          e.addEventListener('blur', () => {
            if (!this._edit)
              return
            const value = e.textContent.toString()
            if (value && value !== original)
              this.setRecord(keypath, this.currentLocale, value)
          })
        }
      }
    })
  }

  private editOff() {
    document.querySelectorAll('[data-i18n-ally-key]').forEach((e) => {
      e.removeAttribute('contenteditable')
    })
  }
}

;(() => {
  const i18nAlly = new I18nAlly()
  // @ts-ignore
  window.$i18nAlly = i18nAlly

  window.addEventListener('load', () => {
    window.dispatchEvent(new CustomEvent<any>('i18n-ally-ready', { detail: { i18nAlly } }))
    i18nAlly.edit = true
  })

  window.addEventListener('i18n-ally-register', (e: any) => {
    const { name, instance } = e.detail as { name: string; instance: any }
    const adaptor = adaptors[name]
    if (!adaptor) {
      console.warn(`[i18n Ally] Unknown adaptor ${name}`)
      return
    }
    adaptor(i18nAlly, instance)
  })
})()
