(() => {
  interface I18nAllyAdaptor {
    name: string
    getCurrentLocale: () => string
  }

  class I18nAlly {
    _listeners: Record<number, Function> = {}
    _id_count = 0
    _edit = false
    _adaptor: I18nAllyAdaptor = {
      name: 'none',
      getCurrentLocale() { throw new Error('NOT REGISTED') },
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
      console.log(`[i18n Ally] Adaptor ${adaptor.name} registered`)
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
        const original = e.textContent
        const keypath = e.getAttribute('data-i18n-ally-key')
        if (keypath) {
          e.setAttribute('contenteditable', 'true')
          if (!e.getAttribute('data-i18n-ally-binding')) {
            e.setAttribute('data-i18n-ally-binding', 'true')
            e.addEventListener('blur', () => {
              if (!this._edit)
                return
              if (e.textContent && e.textContent !== original)
                this.setRecord(keypath, this.currentLocale, e.textContent)
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

  // @ts-ignore
  window.$i18nAlly = new I18nAlly()

  // FIXME: TESTING
  window.addEventListener('load', () => {
    // @ts-ignore
    window.$i18nAlly.edit = true
  })
})()
