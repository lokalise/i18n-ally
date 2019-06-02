
export default class EventHandler<T extends string> {
  private listeners: Record<string, Function[]> = {}

  addEventListener (key: T, handler: Function) {
    if (!this.listeners[key])
      this.listeners[key] = []
    this.listeners[key].push(handler)
  }

  removeEventListener (key: T, handler: Function) {
    this.listeners[key] = (this.listeners[key] || []).filter(f => f === handler)
  }

  dispatchEvent (key: T, payload?: any) {
    for (const handler of this.listeners[key] || [])
      handler(payload)
  }
}
