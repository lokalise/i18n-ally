import { Parser } from './Parser'
import { window } from 'vscode'

export class JavascriptParser extends Parser {
  private esm: (filepath: string) => any

  constructor () {
    super(['javascript', 'typescript'], /\.?(t|j)s$/g)
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
    // set mtime to disable cache
    let module = this.esm(`${filepath}?mtime=${+new Date()}`)
    if ('default' in module)
      module = module.default
    if (typeof module === 'function')
      module = module()

    module = await Promise.resolve(module)

    return JSON.parse(JSON.stringify(module))
  }

  async save () {
    window.showErrorMessage('Writing to js file is not supported')
  }

  navigateToKey (text: string, keypath: string) {
    return undefined
  }
}
