import child_process from 'child_process'
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
    const loader = path.resolve(Config.extensionPath!, 'assets/loader.js')
    const tsNode = Config.parsersTypescriptTsNodePath
    const dir = Global.rootpath
    const compilerOptions = {
      ...Config.parsersTypescriptCompilerOption,
      allowJs: true,
    }

    return new Promise<any>((resolve, reject) => {
      const cmd = `${tsNode} --dir "${dir}" --compiler-options '${JSON.stringify(compilerOptions)}' "${loader}" "${filepath}"`
      child_process.exec(cmd, (err, stdout) => {
        if (err)
          return reject(err)

        console.log(`[i18n-ally] spawn: ${cmd}`)
        resolve(JSON.parse(stdout.trim()))
      })
    })
  }

  async save() {
    Log.error(i18n.t('prompt.writing_js'))
  }
}