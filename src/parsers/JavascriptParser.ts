import { register as registerTsNode } from 'ts-node'
import i18n from '../i18n'
import { Log } from '../utils'
import { Parser } from './Parser'

process.env.ESM_DISABLE_CACHE = '1'

export class JavascriptParser extends Parser {
  private esm: (filepath: string, options?: any) => any
  readonly readonly = true

  constructor () {
    super(['javascript', 'typescript'], /\.?(jsx?|tsx?)$/g)
    registerTsNode()
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const esm = require('esm')
    this.esm = esm(module, { cache: false, force: true })
  }

  async parse (text: string) {
    return {}
  }

  async dump (object: object) {
    return ''
  }

  async load (filepath: string) {
    // set mtime to disable cache
    let m = this.esm(`${filepath}?mtime=${+new Date()}`, { cache: false })
    if ('default' in m)
      m = m.default
    if (typeof m === 'function')
      m = m()

    m = await Promise.resolve(m)

    return JSON.parse(JSON.stringify(m))
  }

  async save () {
    Log.error(i18n.t('prompt.writing_js'))
  }
}
