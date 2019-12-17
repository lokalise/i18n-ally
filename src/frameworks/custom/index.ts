import path from 'path'
import fs from 'fs'
import YAML from 'js-yaml'
import { workspace, FileSystemWatcher } from 'vscode'
import { Global } from '../../core'
import { Framework } from '../base'
import { LanguageId, File, Log } from '../../utils'
import i18n from '../../i18n'

const CustomFrameworkConfigFilename = './.vscode/i18n-ally-custom-framework.yml'

interface CustomFrameworkConfig {
  monopoly?: boolean
  languageIds?: LanguageId[] | LanguageId
  keyMatchReg?: string[] | string
}

class CustomFramework extends Framework {
  id = 'custom'
  display = 'Custom'

  private watchingFor: string | undefined
  private watcher: FileSystemWatcher | undefined
  private data: CustomFrameworkConfig | undefined

  detection = {
    none: (_: string[], root: string) => {
      return this.load(root)
    },
  }

  load (root: string) {
    this.startWatch(root)
    const filename = path.resolve(root, CustomFrameworkConfigFilename)
    console.log(filename)

    if (!fs.existsSync(filename)) {
      this.data = undefined
      return false
    }

    try {
      const raw = File.readSync(filename)
      this.data = YAML.safeLoad(raw)
      Log.info(`🍱 Custom framework setting loaded. \n\tLanguage Ids:\n\t\t${this.languageIds.join('\n\t\t')}\n\tKey Match Regex:\n\t\t${this.keyMatchReg.map(r => r.source).join('\n\t\t')}`)
      return true
    }
    catch (e) {
      Log.error(e)
      this.data = undefined
      return false
    }
  }

  get languageIds (): LanguageId[] {
    let id = this.data?.languageIds || []
    if (typeof id === 'string')
      id = [id]

    return id
  }

  get keyMatchReg (): RegExp[] {
    let id = this.data?.keyMatchReg || []
    if (typeof id === 'string')
      id = [id]

    return id
      .map((i) => {
        try {
          return new RegExp(i, 'gm')
        }
        catch (e) {
          Log.error(i18n.t('prompt.error_on_parse_custom_regex', i), true)
          Log.error(e, false)
          return undefined
        }
      })
      .filter(i => i) as RegExp[]
  }

  get monopoly () {
    return this.data?.monopoly || false
  }

  refactorTemplates (keypath: string) {
    return [
      keypath,
    ]
  }

  startWatch (root?: string) {
    if (this.watchingFor) {
      this.watchingFor = undefined
      if (this.watcher)
        this.watcher.dispose()
    }
    this.watchingFor = root
    if (root) {
      const filename = path.resolve(root, CustomFrameworkConfigFilename)

      this.watcher = workspace.createFileSystemWatcher(filename)

      const reload = () => {
        Log.info('\n🍱 Custom framework setting changed. Reloading...')
        this.watchingFor = undefined
        if (this.watcher) {
          this.watcher.dispose()
          Global.update()
        }
      }

      this.watcher.onDidChange(reload)
      this.watcher.onDidCreate(reload)
      this.watcher.onDidDelete(reload)
    }
  }
}

export default CustomFramework
