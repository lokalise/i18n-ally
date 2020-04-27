import child_process from 'child_process'
import path from 'path'
import i18n from '../i18n'
import { Log } from '../utils'
import { Config, Global } from '../core'
import { Parser } from './base'

const LanguageIds = {
  js: 'javascript',
  ts: 'typescript',
} as const

const LanguageExts = {
  js: 'm?js',
  ts: 'ts',
} as const

export class EcmascriptParser extends Parser {
  readonly readonly = true

  constructor(public readonly id: 'js'|'ts' = 'js') {
    super([LanguageIds[id]], LanguageExts[id])
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
      importHelpers: false,
      allowJs: true,
      ...Config.parsersTypescriptCompilerOption,
    }
    const options = JSON.stringify(compilerOptions).replace(/"/g, '\\"')

    return new Promise<any>((resolve, reject) => {
      const cmd = `${tsNode} --dir "${dir}" --compiler-options "${options}" "${loader}" "${filepath}"`
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
