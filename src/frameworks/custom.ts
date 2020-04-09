import path from 'path'
import fs from 'fs'
import { workspace, FileSystemWatcher } from 'vscode'
import YAML from 'js-yaml'
import { Global } from '../core'
import { LanguageId, File, Log } from '../utils'
import { Framework } from './base'

const CustomFrameworkConfigFilename = './.vscode/i18n-ally-custom-framework.yml'

interface CustomFrameworkConfig {
  monopoly?: boolean
  languageIds?: LanguageId[] | LanguageId
  keyMatchReg?: string[] | string
  refactorTemplates?: string[]
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

  load(root: string) {
    this.startWatch(root)
    const filename = path.resolve(root, CustomFrameworkConfigFilename)

    if (!fs.existsSync(filename)) {
      this.data = undefined
      return false
    }

    try {
      const raw = File.readSync(filename)
      this.data = YAML.safeLoad(raw)
      Log.info(`🍱 Custom framework setting loaded. \n\tLanguage Ids:\n\t\t${this.languageIds.join('\n\t\t')}\n\tKey Match Regex:\n\t\t${this.getKeyMatchReg().map(r => r.source).join('\n\t\t')}`)
      return true
    }
    catch (e) {
      Log.error(e)
      this.data = undefined
      return false
    }
  }

  get languageIds(): LanguageId[] {
    let id = this.data?.languageIds || []
    if (typeof id === 'string')
      id = [id]

    return id
  }

  get keyMatchReg(): string[] {
    let id = this.data?.keyMatchReg || []
    if (typeof id === 'string')
      id = [id]

    return id
  }

  get monopoly() {
    return this.data?.monopoly || false
  }

  refactorTemplates(keypath: string) {
    return (this.data?.refactorTemplates || ['$1'])
      .map(i => i.replace(/\$1/g, keypath))
  }

  startWatch(root?: string) {
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
