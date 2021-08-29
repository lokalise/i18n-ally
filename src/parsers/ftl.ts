import { mergeFtl, getFtlMessages } from 'fluent-vue-cli'
import { Parser } from './base'
import { File } from '~/utils'

export class FluentParser extends Parser {
  id = 'ftl'

  constructor() {
    super(['ftl'], 'ftl')
  }

  async parse(text: string) {
    return getFtlMessages(text)
  }

  async dump(): Promise<string> {
    throw new Error('Not implemented')
  }

  async save(filepath: string, object: Record<string, string>) {
    const currentFile = await File.read(filepath)
    const text = mergeFtl(currentFile, object)

    await File.write(filepath, text)
  }
}
