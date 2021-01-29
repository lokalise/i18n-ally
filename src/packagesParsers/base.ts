import fs from 'fs'
import { File, Log } from '~/utils'

export abstract class PackageParser {
  static filename: string

  static load(root: string) {
    const filepath = `${root}/${this.filename}`
    if (!fs.existsSync(filepath)) {
      Log.info(`🕳 Packages file "${this.filename}" not exists`)
      return undefined
    }

    Log.info(`📦 Packages file "${this.filename}" found`)

    try {
      const raw = this.loadFile(filepath)
      const data = this.parserRaw(raw)
      return data
    }
    catch (err) {
      Log.info(`⚠ Error on parsing package file "${this.filename}"`)
    }

    return undefined
  }

  protected static loadFile(filepath: string) {
    return File.readSync(filepath)
  }

  protected static parserRaw(raw: string) {
    const {
      dependencies = {},
      devDependencies = {},
      peerDependencies = {},
    } = JSON.parse(raw)

    return [...Object.keys(dependencies), ...Object.keys(devDependencies), ...Object.keys(peerDependencies)]
  }
}
