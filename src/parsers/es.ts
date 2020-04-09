import cp from 'child_process'
import path from 'path'
import i18n from '../i18n'
import { Log } from '../utils'
import { Config, Global } from '../core'
import { Parser } from './base'

export class EcmascriptParser extends Parser {
  readonly readonly = true

  constructor(public readonly id: 'js'|'ts' = 'js') {
    super([id === 'js' ? 'javascript' : 'typescript'], id)
  }

  async parse() {
    return {}
  }

  async dump() {
    return ''
  }

  async load(filepath: string) {
    const extensionPath = Config.extensionPath!
    const loader = path.resolve(extensionPath, 'assets/loader.js')
    const tsNode = path.resolve(extensionPath, 'node_modules/ts-node/dist/bin.js')
    const dir = Global.rootpath
    const override = {
      allowJs: true,
    }

    return new Promise<any>((resolve, reject) => {
      const cmd = `node "${tsNode}" --dir "${dir}" -O '${JSON.stringify(override)}' "${loader}" "${filepath}"`
      cp.exec(cmd, (err, stdout) => {
        if (err)
          return reject(err)

        console.log(cmd, stdout)
        resolve(JSON.parse(stdout.trim()))
      })
    })
  }

  async save() {
    Log.error(i18n.t('prompt.writing_js'))
  }
}
