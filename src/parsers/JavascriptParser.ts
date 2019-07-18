import { register as registerTsNode } from 'ts-node'
import i18n from '../i18n'
import { Log } from '../utils'
import { Parser } from './Parser'

export class JavascriptParser extends Parser {
  private esm: (filepath: string) => any
  readonly readonly = true

  constructor () {
    super(['javascript', 'typescript'], /\.?(t|j)s$/g)
    registerTsNode()
    this.esm = require('esm')(module, { cache: false })
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
    Log.error(i18n.t('prompt.writing_js'))
  }

  navigateToKey (text: string, keypath: string) {
    return { start: 0, end: 0 }
  }
}
