
export class ListenerHost {
  _listeners: Record<string, Function[]> = {}

  on(event: string, fn: Function) {
    if (!this._listeners[event])
      this._listeners[event] = []
    this._listeners[event].push(fn)
  }

  off(event: string, fn: Function) {
    if (!this._listeners[event])
      return
    const index = this._listeners[event].indexOf(fn)
    if (index >= 0)
      this._listeners[event].splice(index, 1)
  }

  clear(event: string) {
    delete this._listeners[event]
  }

  emit(event: string, data?: any) {
    for (const fn of this._listeners[event] || [])
      fn(data)
  }
}
