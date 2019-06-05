import { Parser } from './Parser'

export class JavascriptParser extends Parser {
  private esm: (filepath: string) => any

  constructor () {
    super(['javascript'], /\.?js$/g)
    this.esm = require('esm')(module, { cache: false })
    this._writable = false
  }

  async parse (text: string) {
    return {}
  }

  async dump (object: object) {
    return ''
  }

  async load (filepath: string) {
    let module = this.esm(filepath)
    if ('default' in module)
      module = module.default
    if (typeof module === 'function')
      module = module()

    module = await Promise.resolve(module)

    return JSON.parse(JSON.stringify(module))
  }

  async save (filepath: string, object: object) {
    // TODO: raise a warning
  }

  navigateToKey (text: string, keypath: string) {
    return undefined
  }
}
