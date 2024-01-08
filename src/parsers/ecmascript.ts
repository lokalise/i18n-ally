import child_process from 'child_process'
import path from 'path'
import { Parser } from './base'
import { Config, Global } from '~/core'
import { getFramework } from '~/frameworks'
import CustomFramework from '~/frameworks/custom'
import { File, Log } from '~/utils'

const LanguageIds = {
  js: 'javascript',
  ts: 'typescript',
} as const

const LanguageExts = {
  js: 'm?js',
  ts: 'ts',
} as const

export class EcmascriptParser extends Parser {
  readonly readonly = false

  private framework: CustomFramework

  constructor(public readonly id: 'js'|'ts' = 'js') {
    super([LanguageIds[id]], LanguageExts[id])
    this.framework = getFramework('custom') as CustomFramework
  }

  async parse() {
    return {}
  }

  async dump(object: object) {
    return JSON.stringify(object, null, 2)
  }

  async save(filepath: string, object: object): Promise<void> {
    const templates = this.framework.tsFileTemplates

    let selectedTemplate: string | undefined
    for (const [key, template] of Object.entries(templates)) {
      if (filepath.endsWith(key)) {
        selectedTemplate = template
        break
      }
    }

    if (!selectedTemplate) {
      if (templates.default)
        selectedTemplate = templates.default
    }

    if (!selectedTemplate) {
      Log.error(`[i18n-ally] no template found for ${filepath}`)
      return
    }

    const localization = await this.dump(object)
    const text = selectedTemplate.replace('$1', localization)

    await File.write(filepath, text)
  }

  async load(filepath: string) {
    const loader = path.resolve(Config.extensionPath!, 'assets/loader.js')
    const tsNode = Config.parsersTypescriptTsNodePath
    const dir = Global.rootpath
    const compilerOptions = {
      importHelpers: false,
      allowJs: true,
      module: 'commonjs',
      ...Config.parsersTypescriptCompilerOption,
    }
    const options = JSON.stringify(compilerOptions).replace(/"/g, '\\"')

    return new Promise<any>((resolve, reject) => {
      const cmd = `${tsNode} --dir "${dir}" --transpile-only --compiler-options "${options}" "${loader}" "${filepath}"`
      // eslint-disable-next-line no-console
      console.log(`[i18n-ally] spawn: ${cmd}`)
      child_process.exec(cmd, (err, stdout) => {
        if (err)
          return reject(err)
        try {
          resolve(JSON.parse(stdout.trim()))
        }
        catch (e) {
          reject(e)
        }
      })
    })
  }
}
