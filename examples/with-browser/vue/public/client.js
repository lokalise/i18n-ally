(() => {
  class I18nAlly {
    _listeners = {}

    constructor(url = 'localhost:1897') {
      this.msgid = 0
      this._edit = false
      this.ws = new WebSocket(`ws://${url}`)
      this.ws.onmessage = (e) => {
        const data = JSON.parse(e.data)
        console.log(data)
        if (data._id && this._listeners[data._id])
          this._listeners[data._id](data)
      }
    }

    send(data) {
      this.ws.send(JSON.stringify(data))
    }

    async call(data) {
      return new Promise((resolve) => {
        const id = this.msgid++
        this._listeners[id] = (data) => {
          delete this._listeners[id]
          resolve(data)
        }
        this.send({ ...data, _id: id })
      })
    }

    getRecord(keypath, locale) {
      return this.call({ type: 'get_record', keypath, locale })
    }

    setRecord(keypath, locale, value) {
      return this.call({ type: 'set_record', keypath, locale, value })
    }

    get currentLocale() {
      return window.$i18n.locale // TODO:
    }

    get edit() {
      return this._edit
    }

    set edit(v) {
      this._edit = v
      if (this._edit)
        this.editOn()
    }

    editOn() {
      document.querySelectorAll('[data-i18n-ally-key]').forEach((e) => {
        const original = e.textContent
        const keypath = e.dataset.i18nAllyKey
        if (keypath) {
          e.setAttribute('contenteditable', true)
          e.addEventListener('blur', () => {
            if (e.textContent !== original)
              this.setRecord(keypath, this.currentLocale, e.textContent)
          })
        }
      })
    }
  }

  window.$i18nAlly = new I18nAlly()

  window.addEventListener('load', () => {
    window.$i18nAlly.edit = true
  })
})()
