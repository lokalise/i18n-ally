import path from 'path'
import fs from 'fs'
import { workspace, FileSystemWatcher } from 'vscode'
import YAML from 'js-yaml'
import { Framework } from './base'
import { Global } from '~/core'
import { LanguageId, File, Log } from '~/utils'

const CustomFrameworkConfigFilename = './.vscode/i18n-ally-custom-framework.yml'

interface CustomFrameworkConfig {
  languageIds?: LanguageId[] | LanguageId
  usageMatchRegex?: string[] | string
  refactorTemplates?: string[]
  monopoly?: boolean

  keyMatchReg?: string[] | string // depreacted. use "usageMatchRegex" instead
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
      this.data = YAML.load(raw) as any
      Log.info(`🍱 Custom framework setting loaded. \n${JSON.stringify(this.data, null, 2)}\n`)
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

  get usageMatchRegex(): string[] {
    let id = this.data?.usageMatchRegex ?? this.data?.keyMatchReg ?? []
    if (typeof id === 'string')
      id = [id]

    return id
  }

  // @ts-expect-error
  get monopoly() {
    return this.data?.monopoly || false
  }

  set monopoly(_) {}

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
